# Website deployment

Production URL: https://elancabin.com/
Application source and GitHub Pages repository: `nolawi/logcabinscout`

GitHub Pages uses **GitHub Actions** as its source, with custom domain
`elancabin.com` and HTTPS enforced. The domain already points to GitHub Pages.
The historical placeholder source remains in `asyncdc/elancabin`, whose custom
domain assignment has been removed. No further writes to that repository are needed.

## Deploy

Pushes to `main` automatically run `.github/workflows/deploy.yml`. The workflow:

1. Installs locked dependencies on Node 22 and runs all tests.
2. Verifies the generated feed matches the reviewed source.
3. Builds Vite and uploads only `dist/` as the Pages artifact.
4. Deploys through the `github-pages` environment using GitHub's short-lived token.

No PAT, cross-repository write access, or paid hosting service is needed. Build
failures prevent deployment. Deployments run in sequence, and only the deploy job
receives Pages write and identity-token permissions.

To redeploy the current remote `main`, use GitHub Actions → Deploy website → Run
workflow, or run `npm run deploy` with an authenticated GitHub CLI. Uncommitted or
unmerged local changes are not included in that deployment.

Vite's base is `/` because the app is hosted at the domain root. `public/CNAME`
records the domain; the repository's Pages settings control the active assignment.
Do not restore the domain assignment on the old placeholder repository.

## Verify and roll back

After a deployment, inspect its Actions result and open the live site on desktop.
Check the JS/CSS assets, `/listings.json`, property photos, search, sort, and reset.
External image hosts can fail independently; branded fallbacks remain available.

To roll back, revert the relevant source commit on `main`; the workflow tests,
builds, and deploys the reverted app. GitHub manages the HTTPS certificate.
