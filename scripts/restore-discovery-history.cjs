/** Select the newest retained artifact from this workflow on main, including partial runs. */
module.exports = async ({ github, context, core }) => {
  const repository = { owner: context.repo.owner, repo: context.repo.repo };
  const { data: workflow } = await github.rest.actions.getWorkflow({ ...repository, workflow_id: 'rentcast-discover.yml' });
  const { data } = await github.rest.actions.listArtifactsForRepo({ ...repository, name: 'rentcast-discovery-history', per_page: 100 });
  const artifacts = data.artifacts.filter(item => !item.expired && item.name === 'rentcast-discovery-history' && item.workflow_run?.head_branch === 'main')
    .sort((a, b) => b.id - a.id);
  for (const artifact of artifacts) {
    const { data: run } = await github.rest.actions.getWorkflowRun({ ...repository, run_id: artifact.workflow_run.id });
    if (run.workflow_id !== workflow.id || run.head_branch !== 'main' || !['schedule', 'workflow_dispatch'].includes(run.event)) continue;
    core.setOutput('run_id', String(run.id));
    core.notice(`Restoring discovery history from run ${run.id}.`);
    return;
  }
  core.notice('No retained discovery history found; starting a new history.');
};
