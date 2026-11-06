import { compileWorkflow } from './workflow-engine.js';

self.addEventListener('message', ({ data }) => {
  if (data?.type !== 'compile') return;
  const { runId, revision, review, audience } = data;
  try {
    const artifact = compileWorkflow({ revision, review, audience });
    self.postMessage({ type: 'result', runId, revision, artifact });
  } catch {
    self.postMessage({ type: 'error', runId, revision });
  }
});
