/** Publish the built site to the existing Pages repo without changing domain settings. */
import { execFileSync } from 'node:child_process';
import { mkdtemp, cp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, encoding:'utf8', stdio:['ignore','pipe','pipe'] }).trim();
const hadBuildInfo = await access(join(root, 'tsconfig.tsbuildinfo')).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; });
const temporary = await mkdtemp(join(tmpdir(), 'elancabin-deploy-'));
try {
  if (run('git', ['status','--porcelain'])) throw new Error('Commit source changes before deploying.');
  const sha = run('git',['rev-parse','HEAD']);
  console.log('Testing and building the production site…');
  execFileSync('npm',['test'],{cwd:root,stdio:'inherit'});
  execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'});
  run('git',['clone','--depth','1','--branch','main','https://github.com/asyncdc/elancabin.git',temporary]);
  const domain = (await readFile(join(temporary,'CNAME'),'utf8')).trim();
  if (domain !== 'elancabin.com') throw new Error('Unexpected hosting domain; refusing to replace its site.');
  const previous = run('git',['rev-parse','HEAD'],temporary);
  const branch = `deploy/logcabinscout-${sha.slice(0,12)}`;
  run('git',['switch','-c',branch],temporary);
  // Preserve all pre-existing files; only replace files present in the app build.
  await cp(join(root,'dist'),temporary,{recursive:true});
  await writeFile(join(temporary,'.nojekyll'),'');
  let metadata = {repository:'nolawi/logcabinscout',commit:sha,previousHostingCommit:previous};
  try {
    const saved = JSON.parse(await readFile(join(temporary,'deployment.json'),'utf8'));
    if (saved.commit === sha) metadata = saved;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(join(temporary,'deployment.json'),JSON.stringify(metadata,null,2)+'\n');
  run('git',['add','index.html','assets','CNAME','favicon.svg','hero-landscape.svg','logo-mark.svg','listings.json','.nojekyll','deployment.json'],temporary);
  if (!run('git',['diff','--cached','--name-only'],temporary)) {console.log('Hosting files are already current.');}
  else {
    run('git',['-c','user.name=Log Cabin Scout deployment','-c','user.email=deployment@users.noreply.github.com','commit','-m',`Deploy Log Cabin Scout ${sha.slice(0,12)}`],temporary);
    run('git',['switch','main'],temporary);
    run('git',['merge','--ff-only',branch],temporary);
    run('git',['push','origin','main'],temporary);
    console.log(`Published ${sha.slice(0,12)} to asyncdc/elancabin. GitHub Pages must finish its build.`);
  }
} catch(error) {
  console.error(error.message);process.exitCode=1;
} finally {
  await rm(temporary,{recursive:true,force:true});
  if (!hadBuildInfo) await rm(join(root,'tsconfig.tsbuildinfo'),{force:true});
}
