import { useEffect, useState } from 'react';
import { compileWorkflow } from './workflow-engine.js';

export default function useWorkflowRunner(state, dispatch) {
  const [mode, setMode] = useState(typeof Worker === 'function' ? 'worker' : 'fallback');
  const runId = state.run?.id;
  const revision = state.run?.revision;
  useEffect(() => {
    if (state.phase !== 'running' || runId == null) return;
    let active = true;
    let worker;
    const payload = { type: 'compile', runId, revision, review: { ...state.review }, audience: state.audience };
    function fail() { if (active) dispatch({ type: 'WORKER_ERROR', runId, revision }); }
    function fallback() {
      setMode('fallback');
      queueMicrotask(() => {
        if (!active) return;
        try { dispatch({ type: 'WORKER_RESULT', runId, revision, artifact: compileWorkflow(payload) }); } catch { fail(); }
      });
    }
    if (typeof Worker !== 'function') fallback();
    else {
      try {
        worker = new Worker(new URL('./workflow.worker.js', import.meta.url), { type: 'module' });
        setMode('worker');
        worker.addEventListener('message', ({ data }) => {
          if (!active || data?.runId !== runId || data?.revision !== revision) return;
          if (data.type === 'result') dispatch({ type: 'WORKER_RESULT', runId, revision, artifact: data.artifact });
          else fail();
        });
        worker.addEventListener('error', event => { event.preventDefault(); fail(); });
        worker.addEventListener('messageerror', fail);
        worker.postMessage(payload);
      } catch { worker?.terminate(); fallback(); }
    }
    return () => { active = false; worker?.terminate(); };
  }, [runId, revision, state.phase, dispatch]);
  return { mode };
}
