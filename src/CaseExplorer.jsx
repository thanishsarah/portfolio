import React from 'react';
import ProjectArtwork from './ProjectArtwork';
import { caseStudies } from './case-studies';
import './case-explorer.css';

function CaseArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function CaseExplorer({ selectedId, onSelect, onDiscuss }) {
  const active = caseStudies.find(item => item.id === selectedId) || caseStudies[0];
  const activeIndex = caseStudies.indexOf(active);

  return <section id="work" className="case-section" aria-labelledby="case-section-title"><div className="container">
    <div className="case-section-heading"><div><p className="eyebrow">THE WORK / CONTEXT, CONTRIBUTION, JUDGEMENT</p><h2 id="case-section-title">Look beneath<br /><em>the finished output.</em></h2></div><p>Four contexts. Different responsibilities. A closer look at the people, questions, and choices behind the work.</p></div>
    <div className="case-explorer">
      <div className="case-index"><p className="case-index-label">CHOOSE A CONTEXT</p><div role="group" aria-label="Explore work contexts">{caseStudies.map((item, index) => <button type="button" key={item.id} className="case-index-button" aria-pressed={active.id === item.id} aria-controls="case-dossier" onClick={() => onSelect?.(item.id)}><span className="case-index-number" aria-hidden="true">0{index + 1}</span><span><span className="case-index-name">{item.shortTitle}</span><span className="case-index-status">{item.status}</span></span><CaseArrow /></button>)}</div><p className="case-index-note">These accounts explain my responsibility and approach. Public context is linked within each account; original institutional materials remain private.</p></div>
      <article className="case-dossier" id="case-dossier" aria-labelledby="case-title">
        <div className="case-dossier-topline"><p>CONTEXT / 0{activeIndex + 1}</p><span>{active.status}</span></div>
        <div className="case-introduction" aria-live="polite" aria-atomic="true"><div><h3 id="case-title">{active.title}</h3><p className="case-summary">{active.summary}</p></div><div className="case-supporting-art"><ProjectArtwork kind={active.kind} /><span>ORIGINAL PORTFOLIO ILLUSTRATION</span></div></div>
        <dl className="case-remit"><div><dt>MY RESPONSIBILITY</dt><dd>{active.role}</dd></div><div><dt>SCOPE</dt><dd>{active.scope}</dd></div></dl>
        <div className="case-account"><div className="case-context-copy"><p className="case-small-label">THE CONTEXT</p><p>{active.context}</p></div><div><p className="case-small-label">{active.contributionTitle}</p><ul className="case-contributions">{active.contribution.map(item => <li key={item}>{item}</li>)}</ul></div></div>
        <div className="case-question"><p className="case-small-label">A QUESTION BEHIND THE WORK</p><p>{active.question}</p><span>A present working lens for understanding this context.</span></div>
        <div className="case-human-context"><div><p className="case-small-label">PEOPLE & CONTEXT</p><p>{active.people}</p></div><div><p className="case-small-label">WHAT NEEDS CARE</p><p>{active.constraint}</p></div></div>
        <div className="case-approach"><p className="case-small-label">THE APPROACH I BRING</p><ol>{active.approach.map((item, index) => <li key={item}><span aria-hidden="true">0{index + 1}</span><p>{item}</p></li>)}</ol></div>
        <div className="case-evidence"><div className="case-evidence-heading"><span className="case-evidence-dot" aria-hidden="true" /><p>{active.evidence.label}</p></div><p>{active.evidence.summary}</p><p className="case-evidence-boundary">{active.evidence.boundary}</p><div className="case-public-links">{active.links.map(link => <a href={link.url} key={link.url} target="_blank" rel="noopener noreferrer">{link.label}<CaseArrow /></a>)}</div></div>
        <div className="case-connections"><p className="case-small-label">WHERE THIS CONNECTS</p>{active.connections.map(connection => <a key={connection.target} href={connection.target}><span><strong>{connection.label}</strong><span>{connection.reason}</span></span><CaseArrow /></a>)}</div>
        <div className="case-next-conversation"><div><p className="case-small-label">A CONVERSATION TO HAVE</p><p>{active.conversation}</p></div>{onDiscuss ? <button type="button" onClick={() => onDiscuss(active)}>Discuss this context<CaseArrow /></button> : <a href="#contact">Discuss this context<CaseArrow /></a>}</div>
      </article>
    </div>
  </div></section>;
}
