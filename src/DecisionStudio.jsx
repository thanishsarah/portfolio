import React, { useEffect, useReducer, useRef, useState } from 'react';
import { buildDecisionReview, reviewChoices, studioBrief } from './decision-studio';
import { createWorkflow, workflowReducer, getWorkflowView, exportWorkflowTrace, replayWorkflow } from './workflow-engine';
import useWorkflowRunner from './useWorkflowRunner';
import WorkflowGraph from './WorkflowGraph';
import './decision-studio.css';

function StudioArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function artifactText(artifact) {
  return artifact ? [artifact.subject, ...(artifact.passages || []).map(passage => passage.text)].join('\n\n') : '';
}

function replayComparable(state) {
  return JSON.stringify({ revision:state.revision, phase:state.phase, review:state.review, audience:state.audience, artifact:state.artifact, approval:state.approval, snapshots:state.snapshots, activeSnapshot:state.activeSnapshot });
}

function SnapshotComparison({ current, previous, activeId }) {
  if (!current) return <p className="studio-inspector-empty">Create a local snapshot to preserve a reviewed example. It stays in this page.</p>;
  const before = previous?.artifact;
  const after = current.artifact;
  const rows = [
    { id:'subject', title:'Subject', before:before?.subject, after:after?.subject },
    ...(after?.passages || []).map(passage => ({ id:passage.id, title:passage.label, before:before?.passages?.find(item => item.id === passage.id)?.text, after:passage.text })),
  ];
  return <div className="studio-comparison"><div className="studio-comparison-heading"><h4>Snapshot comparison</h4><span>{activeId === current.id ? 'CURRENT LOCAL SNAPSHOT' : 'HISTORICAL SNAPSHOT'}</span></div><div className="studio-comparison-labels"><span>{previous ? `Previous · R${previous.revision}` : 'No earlier snapshot'}</span><span>Latest · R{current.revision}</span></div>{rows.map(row => <div className="studio-comparison-row" key={row.id} data-changed={Boolean(previous && row.before !== row.after)}><p><strong>{row.title}</strong><span>{previous ? row.before === row.after ? 'Unchanged' : 'Changed' : 'First snapshot'}</span></p><div><p>{row.before || 'An earlier approved version will appear here.'}</p><p>{row.after}</p></div></div>)}</div>;
}

export default function DecisionStudio({ onExplore } = {}) {
  const [state, dispatch] = useReducer(workflowReducer, undefined, createWorkflow);
  const [replayNote, setReplayNote] = useState('');
  const downloadUrls = useRef(new Set());
  const buildButton = useRef(null);
  const snapshotButton = useRef(null);
  const verdictHeading = useRef(null);
  const runner = useWorkflowRunner(state, dispatch);
  const view = getWorkflowView(state);
  const proposed = buildDecisionReview(state.review, state.audience);
  const displayed = view.artifactIsCurrent ? state.artifact : proposed;
  const journal = state.journal || [];

  useEffect(() => () => { downloadUrls.current.forEach(url => URL.revokeObjectURL(url)); }, []);

  function act(action) {
    onExplore?.(); setReplayNote(''); dispatch(action);
    const destination = action.type === 'CANCEL' ? buildButton : action.type === 'APPROVE' ? snapshotButton : action.type === 'RELEASE' ? verdictHeading : null;
    if (destination) requestAnimationFrame(() => destination.current?.focus({ preventScroll: true }));
  }
  function toggle(id) { act({ type:'SET_REVIEW', id, value:!state.review[id] }); }
  function chooseAudience(audience) { act({ type:'SET_AUDIENCE', audience }); }
  function verifyReplay() {
    onExplore?.();
    try {
      const replayed = replayWorkflow(exportWorkflowTrace(state));
      setReplayNote(replayComparable(replayed) === replayComparable(state) ? 'Replay matches the current state.' : 'The replay differs from the current state. Start fresh before continuing.');
    } catch { setReplayNote('The replay could not be verified. Start fresh before continuing.'); }
  }
  function downloadTrace() {
    onExplore?.();
    const blob = new Blob([JSON.stringify(exportWorkflowTrace(state), null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); downloadUrls.current.add(url);
    const link = document.createElement('a'); link.href = url; link.download = 'vinayak-fictional-workflow-session.json';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => { URL.revokeObjectURL(url); downloadUrls.current.delete(url); }, 1000);
  }

  const verdictDetail = state.error || (state.phase === 'released' ? 'A reviewed fictional example has been preserved as a local snapshot. Nothing has been published or sent.' : state.phase === 'retired' ? 'This example is inactive. Restore it to a new revision, then build and review it again.' : view.blockers?.length ? view.blockers.join(' ') : view.readyForReview ? 'The current checks pass. A person must still inspect and approve this example before a snapshot can be created.' : 'Change the working draft, build this revision, and inspect the checks before deciding what moves forward.');

  return <section id="decision-studio" className="decision-studio" aria-labelledby="studio-title" data-phase={state.phase}>
    <div className="container">
      <div className="studio-introduction"><div><p className="eyebrow studio-eyebrow">JUDGEMENT / A WORKING SYSTEM</p><h2 id="studio-title">A decision,<br /><em>made visible.</em></h2></div><div className="studio-intro-copy"><p>A draft has a beginning, dependencies, and a point where someone must decide. Change its purpose or assumptions, and the old approval should stop being valid.</p><p>Explore that behaviour in this fictional communication workflow. Build, revise, approve, preserve, or retire an example—and inspect what the system remembers.</p></div></div>

      <div className="studio-context-line"><span className="studio-example-label">ORIGINAL FICTIONAL EXAMPLE</span><p>Deterministic rules run locally in your browser. This demonstration uses no live AI service and publishes nothing.</p><span className="studio-revision">REVISION {state.revision}</span></div>

      <div className="studio-controls-bar" role="group" aria-label="Control the example workflow"><button ref={buildButton} className="studio-build" type="button" aria-disabled={!view.canRun} disabled={!view.canRun && state.phase !== 'running'} onClick={() => { if (view.canRun) act({ type:'RUN' }); }}>{state.phase === 'running' ? 'Building…' : 'Build example'}<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4 8 6-8 6V4Z" stroke="currentColor" strokeWidth="1.2" /></svg></button>{view.canCancel && <button type="button" onClick={() => act({ type:'CANCEL' })}>Cancel build</button>}<button type="button" disabled={!view.canApprove} onClick={() => act({ type:'APPROVE' })}>Approve this example</button><button ref={snapshotButton} type="button" disabled={!view.canRelease} onClick={() => act({ type:'RELEASE' })}>Create local snapshot</button><span className="studio-controls-spacer" />{view.canRestore ? <button className="studio-lifecycle" type="button" onClick={() => act({ type:'RESTORE' })}>Restore example</button> : <button className="studio-lifecycle" type="button" disabled={!view.canRetire} onClick={() => act({ type:'RETIRE' })}>Retire example</button>}</div>
      <p className="studio-control-guide">Build the current revision, inspect its checks, then make the human decision. Every edit invalidates the previous approval.</p>
      <WorkflowGraph nodes={view.nodes} onExplore={onExplore} />

      <div className="studio-workspace">
        <div className="studio-document-column">
          <details className="studio-brief"><summary><span><span className="studio-small-label">THE SOURCE BRIEF</span><strong>Start with what is known.</strong></span><span className="studio-brief-toggle" aria-hidden="true">+</span></summary><div className="studio-brief-body"><p>{studioBrief.scenario}</p><ul>{studioBrief.facts.map(fact => <li key={fact}>{fact}</li>)}</ul><p className="studio-brief-boundary">{studioBrief.boundary}</p></div></details>
          <article className="studio-document" aria-labelledby="studio-document-title"><div className="studio-document-topline"><span>{view.artifactIsCurrent ? 'BUILT DRAFT' : 'WORKING DRAFT'} / R{state.revision}</span><span>{view.artifactIsCurrent ? 'CURRENT BUILD' : state.artifact ? 'REBUILD REQUIRED' : 'NOT YET BUILT'}</span></div>{state.artifact && !view.artifactIsCurrent && <p className="studio-stale-note">The R{state.artifact.revision} build is stale. These working changes need a fresh build and review.</p>}<div className="studio-document-copy" id="studio-message"><p className="studio-document-recipient">{state.review.audience ? state.audience === 'leadership' ? 'TO / ACADEMIC & COMMUNICATION LEADS' : 'TO / FAMILIES' : 'TO / AN UNDEFINED AUDIENCE'}</p><h3 id="studio-document-title">{displayed.subject}</h3><div className="studio-passages">{(displayed.passages || []).map((passage,index) => <div className={`studio-passage${passage.reviewed ? ' is-reviewed' : ''}`} key={passage.id}><div className="studio-passage-note"><span aria-hidden="true">0{index+1}</span><span>{passage.label}</span></div><p>{passage.text}</p></div>)}</div></div><div className="studio-document-footer"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3v13h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.2" /></svg><p>A snapshot records an example. It does not publish a message.</p></div></article>
        </div>
        <div className="studio-review-column"><div className="studio-review-heading"><p className="studio-small-label">THE EDITORIAL DECISIONS</p><h3>Change the reasoning.<br />Watch the dependencies change.</h3></div><div className="studio-review-controls" role="group" aria-label="Apply editorial review decisions">{reviewChoices.map((choice,index) => <div className={`studio-choice${state.review[choice.id] ? ' is-applied' : ''}`} key={choice.id}><button type="button" className="studio-choice-button" aria-pressed={state.review[choice.id]} aria-controls="studio-message studio-verdict" aria-describedby={`studio-reason-${choice.id}`} disabled={state.phase === 'retired'} onClick={() => toggle(choice.id)}><span className="studio-choice-number" aria-hidden="true">0{index+1}</span><span>{choice.title}</span><span className="studio-choice-check" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="1.4" /></svg></span></button><div className="studio-choice-reason" id={`studio-reason-${choice.id}`}><p className="studio-choice-question">{choice.question}</p><p>{choice.reason}</p>{state.review[choice.id] && <p className="studio-consequence"><strong>What changes</strong>{choice.consequence}</p>}</div>{choice.id === 'audience' && <fieldset className="studio-audience" disabled={state.phase === 'retired'}><legend>Whose decision are we supporting?</legend><label><input type="radio" name="studio-audience" value="families" checked={state.review.audience && state.audience === 'families'} onChange={() => chooseAudience('families')} /><span>Families</span></label><label><input type="radio" name="studio-audience" value="leadership" checked={state.review.audience && state.audience === 'leadership'} onChange={() => chooseAudience('leadership')} /><span>School leadership</span></label></fieldset>}</div>)}</div><button className="studio-reset" type="button" onClick={() => act({ type:'RESET' })}>Reset the example<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5a6 6 0 1 1-1 7M5 1v5H1" stroke="currentColor" strokeWidth="1.2" /></svg></button><p className="studio-reset-note">Reset clears this example. Its session history remains inspectable until the page is reset or reloaded.</p></div>
      </div>

      <div className={`studio-verdict${view.readyForReview ? ' is-ready' : ''}`} id="studio-verdict" role="status" aria-atomic="true"><div className="studio-verdict-title"><span className="studio-verdict-mark" aria-hidden="true" /><div><p className="studio-small-label">THE CURRENT STATE / R{state.revision}</p><h3 ref={verdictHeading} tabIndex={-1}>{view.label}</h3></div></div><div className="studio-verdict-detail"><p>{verdictDetail}</p><p className="studio-review-count">{proposed.appliedCount} of 3 editorial changes applied · {view.artifactIsCurrent ? `Built revision ${state.artifact.revision}` : 'Current revision needs a build'}</p></div></div>

      <details className="studio-inspector"><summary><span><span className="studio-small-label">FOR A CLOSER TECHNICAL LOOK</span><strong>Inspect the system</strong></span><span aria-hidden="true">+</span></summary><div className="studio-inspector-body"><div className="studio-inspector-intro"><p>Build results belong to a revision. Approval belongs to that result. Edits, cancellation, and retirement invalidate work that is no longer current.</p><p>This is an inspectable browser session, with deterministic replay. It is an illustrative implementation, not a record of client delivery or tamper-proof provenance.</p></div><dl className="studio-system-facts"><div><dt>Current revision</dt><dd>R{state.revision}</dd></div><div><dt>Build fingerprint</dt><dd>{state.artifact?.checksum || 'No build yet'}</dd></div><div><dt>Retained events</dt><dd>{journal.length}</dd></div><div><dt>Execution</dt><dd>{runner.mode === 'worker' ? 'Web Worker' : 'Local fallback'}</dd></div></dl><div className="studio-trace-actions"><button type="button" onClick={verifyReplay}>Verify session replay</button><button type="button" onClick={downloadTrace}>Download example trace<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" stroke="currentColor" strokeWidth="1.3" /></svg></button></div><p className="studio-replay-note" role="status">{replayNote}</p><p className="studio-trace-boundary">The trace contains this fictional example’s settings and events. It does not include your contact draft or confidential documents.</p><div className="studio-history"><h4>Recent session events</h4>{journal.length ? <ol>{journal.slice(-12).reverse().map((event,index) => <li key={event.seq ?? index}><details><summary><span>#{event.seq ?? journal.length-index}</span><strong>{String(event.type || 'event').replaceAll('_',' ').toLowerCase()}</strong><span aria-hidden="true">+</span></summary><pre>{JSON.stringify(event,null,2)}</pre></details></li>)}</ol> : <p className="studio-inspector-empty">The first interaction starts this example’s history.</p>}</div><div className="studio-source-links"><a href="https://github.com/thanishsarah/portfolio/blob/main/src/workflow-engine.js" target="_blank" rel="noopener noreferrer">Inspect the engine<StudioArrow /></a><a href="https://github.com/thanishsarah/portfolio/blob/main/tests/workflow-engine.test.mjs" target="_blank" rel="noopener noreferrer">Read the invariant tests<StudioArrow /></a></div><SnapshotComparison current={view.latestSnapshot} previous={view.previousSnapshot} activeId={state.activeSnapshot} />{state.artifact && !view.artifactIsCurrent && <details className="studio-prior-build"><summary>Inspect the stale R{state.artifact.revision} build</summary><pre>{artifactText(state.artifact)}</pre></details>}</div></details>
      <div className="studio-closing"><p>Capability includes knowing when work should move forward, return for revision, or stop.</p><a href="#contact">Bring a real brief<StudioArrow /></a></div>
    </div>
  </section>;
}
