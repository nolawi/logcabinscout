# Website deployment

Production URL: https://elancabin.com/
Application source: `nolawi/logcabinscout`
Existing GitHub Pages hosting repository: `asyncdc/elancabin`, branch `main`, root `/`

The domain already points to this hosting repository, with HTTPS enforced and a
GitHub-managed certificate. Retaining that configuration avoids DNS changes and
preserves the existing certificate. The connected GitHub integration can push code
but cannot modify Pages settings, so this deployment uses the existing static
Pages build rather than transferring the domain to a new repository.

After committing and merging source changes, run:

```bash
npm run deploy
```

The script runs tests, builds Vite, clones the hosting repo temporarily, checks its
CNAME, copies the built files, and pushes a release commit to its main branch.
It makes no paid API requests. Existing unrelated hosting files are preserved.
Git history retains the original placeholder HTML and every previous release.
`deployment.json` records the app source commit and previous hosting commit.
`.nojekyll` ensures the Vite output is served as static files.

Pushes to the application repo do **not** automatically deploy: run this command
for a release. GitHub builds Pages after the hosting repository receives the push.
Check its `pages-build-deployment` Actions run, then load the domain on desktop.
Verify asset requests, `/listings.json`, photos, search, sort, and reset.

Vite uses base `/` for the domain root, and `public/CNAME` contains `elancabin.com`.
No PAT is stored in either repository; Git uses the environment's existing access.
This remains GitHub's free static hosting.

To roll back, revert the release commit in `asyncdc/elancabin` or redeploy an earlier
application commit. The prior source and placeholder remain available in Git history.
