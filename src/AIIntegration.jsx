import React, { useState } from 'react';
import { aiPractice } from './ai-practice';
import './ai-integration.css';

function AIArrow({ className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function HumanReviewLoop() {
  return <div className="ai-process">
    <div className="ai-process-heading"><p>Human direction / AI-supported work</p><span>DESIGN PRINCIPLE</span></div>
    <svg className="ai-process-diagram" viewBox="0 0 600 130" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.1" opacity=".35"><path d="M94 42h112M244 42h106M400 42h106" /><path d="m200 38 6 4-6 4m144-8 6 4-6 4m156-8 6 4-6 4" /><path d="M525 62v38H75V62" /><path d="m71 68 4-6 4 6" /></g>
      <circle cx="75" cy="42" r="19" fill="#eee7d8" stroke="#18231f" strokeWidth="1.2" />
      <circle cx="75" cy="38" r="4" stroke="#18231f" strokeWidth="1.2" /><path d="M68 49c0-6 14-6 14 0" stroke="#18231f" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="206" y="23" width="38" height="38" rx="8" fill="#c5a36d" />
      <g stroke="#18231f" strokeWidth="1.1"><path d="M219 31v22m12-22v22m-17-16h22m-22 10h22" /><circle cx="225" cy="42" r="3" fill="#18231f" /></g>
      <circle cx="375" cy="42" r="25" stroke="#c5a36d" strokeWidth="1" opacity=".28" />
      <circle cx="375" cy="42" r="19" fill="#c5a36d" /><path d="m367 42 5 5 11-12" stroke="#18231f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="525" cy="42" r="19" fill="#eee7d8" stroke="#52634f" strokeWidth="1.2" />
      <path d="M531 39a7 7 0 1 0 0 7m-1-13 2 7-7-1" stroke="#52634f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="300" cy="100" r="3" fill="#52634f" />
    </svg>
    <ol className="ai-process-labels"><li>Human direction</li><li>AI-supported work</li><li>Human review</li><li>Refine &amp; improve</li></ol>
    <p className="ai-process-caption">A proposed approach: people set the intention, review the output, and decide what moves forward.</p>
  </div>;
}

export default function AIIntegration() {
  const [activeId, setActiveId] = useState(aiPractice.workstreams[0].id);
  const active = aiPractice.workstreams.find(item => item.id === activeId);
  const activeIndex = aiPractice.workstreams.indexOf(active);

  return <section id="ai-integration" className="ai-section" aria-labelledby="ai-integration-title">
    <div className="container ai-container">
      <div className="ai-heading">
        <div><p className="ai-eyebrow">01 / AI INTEGRATION</p><h2 id="ai-integration-title">AI integration,<br /><em>across the whole story.</em></h2></div>
        <div className="ai-introduction"><p className="ai-status"><span aria-hidden="true" />Integration in progress<span className="ai-status-divider" aria-hidden="true">/</span><span className="ai-status-remit">My current remit</span></p><p>{aiPractice.intro}</p></div>
      </div>

      <div className="ai-context"><p>Working contexts</p><ul>{aiPractice.context.map(context => <li key={context.name}>{context.url ? <a href={context.url} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${context.name} (opens in a new tab)`}>{context.name}<AIArrow /></a> : <span>{context.name}</span>}</li>)}</ul></div>

      <div className="ai-workbench">
        <div className="ai-workstream-selector"><p className="ai-selector-label">Four connected workstreams</p><div className="ai-workstream-buttons" role="group" aria-label="Explore AI integration workstreams">{aiPractice.workstreams.map((item, index) => <button type="button" key={item.id} className={`ai-workstream${active.id === item.id ? ' ai-workstream-active' : ''}`} aria-pressed={active.id === item.id} aria-controls="ai-focus-panel" onClick={() => setActiveId(item.id)}><span className="ai-workstream-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="ai-workstream-title">{item.title}</span><AIArrow /></button>)}</div><p className="ai-selector-note">Select a workstream to explore its focus and the human judgement it needs.</p></div>

        <div className="ai-focus-panel" id="ai-focus-panel" role="region" aria-labelledby="ai-focus-title">
          <div className="ai-focus-topline"><p>ONGOING FOCUS</p><span aria-hidden="true">{String(activeIndex + 1).padStart(2, '0')} / 04</span></div>
          <div className="ai-focus-content" aria-live="polite" aria-atomic="true"><h3 id="ai-focus-title">{active.title}</h3><p className="ai-focus-summary">{active.summary}</p><ul className="ai-focus-areas" aria-label="Areas of focus">{active.focus.map(label => <li key={label}>{label}</li>)}</ul><div className="ai-review-checkpoint"><span className="ai-review-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3" /><path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg></span><div><p className="ai-review-label">DESIGN PRINCIPLE / HUMAN REVIEW</p><p>{active.review}</p></div></div></div>
          <HumanReviewLoop />
        </div>
      </div>

      <div className="ai-conversation"><p>For leadership opportunities or consulting conversations,<br /><span>in India and internationally.</span></p><a href="#contact">Discuss AI integration <AIArrow /></a></div>
    </div>
  </section>;
}
