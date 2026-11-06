import React from 'react';
import { aiPractice } from './ai-practice';
import './ai-remit.css';

function LinkArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

const workingPrinciples = [
  { label: 'Define the brief', description: 'Purpose, audience, and shared standards' },
  { label: 'Support the work', description: 'Tools and workflows suited to the task' },
  { label: 'Keep human judgement', description: 'A named reviewer and a clear decision' },
  { label: 'Carry learning forward', description: 'Feedback, guidance, and refinement' },
];

export default function AIRemit() {
  return <section id="ai-integration" className="remit-section" aria-labelledby="remit-title">
    <div className="container remit-container">
      <div className="remit-heading">
        <div className="remit-title-block"><p className="remit-kicker">CURRENT PRACTICE / AI INTEGRATION</p><h2 id="remit-title">Capability,<br /><em>beyond the tool.</em></h2></div>
        <div className="remit-introduction"><p className="remit-status"><span aria-hidden="true" />Integration in progress<span className="remit-status-separator" aria-hidden="true">/</span><span>Current remit</span></p><p>{aiPractice.intro}</p></div>
      </div>

      <div className="remit-context"><p>Working across</p><ul aria-label="Working contexts">{aiPractice.context.map(context => <li key={context.name}>{context.url ? <a href={context.url} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${context.name} (opens in a new tab)`}>{context.name}<LinkArrow /></a> : <span>{context.name}</span>}</li>)}</ul></div>

      <div className="remit-matrix" role="table" aria-label="AI workstreams and human decisions">
        <div className="remit-matrix-header" role="row"><p role="columnheader">Connected workstreams</p><p role="columnheader">Where AI can help</p><p role="columnheader">Where people decide</p></div>
        {aiPractice.workstreams.map((workstream, index) => <div className="remit-row" role="row" key={workstream.id}>
          <div className="remit-workstream" role="rowheader"><span aria-hidden="true">0{index + 1}</span><h3>{workstream.title}</h3></div>
          <div className="remit-support" role="cell"><p className="remit-cell-label" aria-hidden="true">Where AI can help</p><p>{workstream.summary}</p></div>
          <div className="remit-decision" role="cell"><p className="remit-cell-label" aria-hidden="true">Where people decide</p><p>{workstream.review}</p></div>
        </div>)}
      </div>

      <div className="remit-principles"><div className="remit-principles-intro"><p>HOW I APPROACH INTEGRATION</p><h3>A shared way of working.</h3><p>Tools can support a task. People give the work its purpose, standards, and direction.</p></div><ol>{workingPrinciples.map((principle, index) => <li key={principle.label}><span className="remit-principle-number" aria-hidden="true">0{index + 1}</span><div><h4>{principle.label}</h4><p>{principle.description}</p></div></li>)}</ol></div>
      <div className="remit-next"><p>Start with the workflow and its owner.<br /><span>Then decide what should change.</span></p><a href="#decision-studio">Examine an illustrative decision <LinkArrow /></a></div>
    </div>
  </section>;
}
