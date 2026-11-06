import React from 'react';
import { practiceLenses } from './practice-model';
import { caseStudies } from './case-studies';
import './practice-atlas.css';

function AtlasArrow({ className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ConstructionField({ relationshipCount, caseCount, lensIndex }) {
  const relationshipPoints = Array.from({ length: relationshipCount }, (_, index) => relationshipCount > 1 ? 76 + index * (328 / (relationshipCount - 1)) : 240);
  const evidencePoints = Array.from({ length: caseCount }, (_, index) => caseCount > 1 ? 116 + index * (248 / (caseCount - 1)) : 240);

  return <svg className="atlas-construction" viewBox="0 0 1200 480" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
    <g className="atlas-construction-rules" stroke="currentColor" strokeWidth=".7"><path d="M0 28H1200M0 452H1200M40 0V480M1160 0V480M300 0V480M740 0V480" />{Array.from({ length: 15 }, (_, index) => <path key={index} d={`M${40 + index * 80} 23V33M${40 + index * 80} 447V457`} />)}</g>
    <g className="atlas-construction-orbit" stroke="currentColor" strokeWidth=".8"><ellipse cx="153" cy="240" rx="113" ry="164" /><ellipse cx="153" cy="240" rx="89" ry="129" strokeDasharray="2 5" /><path d="M153 76V404M40 240H266" /></g>
    <path className="atlas-origin-arc" d={lensIndex === 1 ? 'M153 76a113 164 0 0 1 113 164' : lensIndex === 2 ? 'M266 240a113 164 0 0 1-113 164' : 'M40 240A113 164 0 0 1 153 76'} stroke="currentColor" strokeWidth="1.5" />
    <g className="atlas-relationship-lines" stroke="currentColor" strokeWidth="1">{relationshipPoints.map((y, index) => <g key={y}><path d={`M266 240H304V${y}H325`} /><circle cx="325" cy={y} r="4" fill="currentColor" /><path d={`M317 ${y - 10}h16M317 ${y + 10}h16`} strokeWidth=".5" /></g>)}</g>
    <g className="atlas-evidence-lines" stroke="currentColor" strokeWidth="1">{evidencePoints.map(y => <g key={y}><path d={`M704 240H740V${y}H785`} /><circle cx="785" cy={y} r="5" fill="currentColor" /><circle cx="785" cy={y} r="11" strokeWidth=".6" /></g>)}</g>
    <path className="atlas-shared-axis" d="M304 240H740" stroke="currentColor" strokeWidth=".7" strokeDasharray="2 7" />
  </svg>;
}

export default function PracticeAtlas({ lensId = 'adoption', onLensChange, onOpenCase, visitedCases = [] }) {
  const lens = practiceLenses.find(item => item.id === lensId) || practiceLenses[0];
  const lensIndex = practiceLenses.indexOf(lens);
  const recommended = lens.caseIds.map(id => caseStudies.find(project => project.id === id)).filter(Boolean);
  const otherCases = caseStudies.filter(project => !lens.caseIds.includes(project.id));
  const visited = new Set(visitedCases);

  return <section id="practice" className="atlas-section" aria-labelledby="atlas-title" data-lens={lens.id}>
    <div className="container">
      <div className="atlas-heading"><div><p className="eyebrow">THE PRACTICE / CONNECTED BY PURPOSE</p><h2 id="atlas-title">Start with a challenge.<br /><em>Follow the relationships.</em></h2></div><p>A learning problem, a communication challenge, and an AI initiative rarely stay inside one discipline. Explore how my experience connects around the work that needs doing.</p></div>

      <div className="atlas-lenses" role="group" aria-label="Choose a challenge to explore">{practiceLenses.map((item, index) => <button type="button" key={item.id} className="atlas-lens" aria-label={item.title} aria-describedby={`atlas-question-${item.id}`} aria-pressed={lens.id === item.id} aria-controls="atlas-route" onClick={() => onLensChange(item.id)}><span className="atlas-lens-index" aria-hidden="true">0{index + 1}</span><span className="atlas-lens-copy"><strong>{item.title}</strong><span id={`atlas-question-${item.id}`}>{item.question}</span></span><AtlasArrow /></button>)}</div>

      <p className="atlas-reading-note"><span aria-hidden="true" /><span>Your chosen challenge connects the experience below and carries through to the next conversation.</span></p>
      <p className="sr-only" role="status">{lens.title} selected. {lens.relationships.length} connections and {recommended.length} relevant case paths.</p>

      <div id="atlas-route" className="atlas-route" role="region" aria-labelledby="atlas-active-title">
        <div className="atlas-route-topline" aria-hidden="true"><span>01 / THE INTENTION</span><span>02 / WHAT NEEDS TO CONNECT</span><span>03 / THE EXPERIENCE BEHIND IT</span></div>
        <div className="atlas-field">
          <ConstructionField relationshipCount={lens.relationships.length} caseCount={recommended.length} lensIndex={lensIndex} />
          <div className="atlas-purpose"><span className="atlas-purpose-mark" aria-hidden="true"><span /></span><p className="atlas-small-label">YOUR CHOSEN CHALLENGE</p><h3 id="atlas-active-title">{lens.title}</h3><p>{lens.description}</p></div>
          <ol className="atlas-relationships" aria-label="Relationships this challenge depends on">{lens.relationships.map((relationship, index) => <li key={relationship.label}><span className="atlas-relationship-number" aria-hidden="true">0{index + 1}</span><div><h4>{relationship.label}</h4><p>{relationship.description}</p></div></li>)}</ol>
          <div className="atlas-case-paths"><p className="atlas-small-label">OPEN A CASE TO EXAMINE MY ROLE</p>{recommended.map(project => <button className="atlas-case-path" type="button" key={project.id} aria-label={`Explore ${project.title} case`} aria-controls="work" onClick={() => onOpenCase(project.id)}><span className="atlas-case-meta">{project.status}{visited.has(project.id) && <span className="atlas-explored">Explored</span>}</span><strong>{project.shortTitle}</strong><span className="atlas-case-scope">{project.scope}</span><span className="atlas-case-action">Examine the work<AtlasArrow /></span></button>)}</div>
        </div>
        <div className="atlas-route-footnote"><span>A CONNECTED VIEW</span><p>These connections explain why a case is relevant to the challenge. Each case distinguishes my contribution, its scope, and what can be shared publicly.</p></div>
      </div>

      {otherCases.length > 0 && <div className="atlas-other-cases"><p>Another part of the picture</p><div>{otherCases.map(project => <button key={project.id} type="button" aria-controls="work" onClick={() => onOpenCase(project.id)}>{project.shortTitle}<AtlasArrow />{visited.has(project.id) && <span className="sr-only">Explored</span>}</button>)}</div></div>}
    </div>
  </section>;
}
