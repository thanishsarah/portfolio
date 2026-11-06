import React, { useState } from 'react';
import { buildDecisionReview, initialReview, reviewChoices, studioBrief } from './decision-studio';
import './decision-studio.css';

function StudioArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export default function DecisionStudio({ onExplore } = {}) {
  const [review, setReview] = useState({ ...initialReview });
  const [audience, setAudience] = useState('families');
  const result = buildDecisionReview(review, audience);

  function toggle(id) {
    onExplore?.();
    setReview(previous => ({ ...previous, [id]: !previous[id] }));
  }

  function chooseAudience(value) {
    onExplore?.();
    setAudience(value);
    setReview(previous => ({ ...previous, audience: true }));
  }

  function reset() {
    setReview({ ...initialReview });
    setAudience('families');
  }

  return <section id="decision-studio" className="decision-studio" aria-labelledby="studio-title">
    <div className="container">
      <div className="studio-introduction">
        <div><p className="eyebrow studio-eyebrow">JUDGEMENT / AN INTERACTIVE EXAMPLE</p><h2 id="studio-title">A decision,<br /><em>made visible.</em></h2></div>
        <div className="studio-intro-copy"><p>A tool can produce a message. Someone still has to decide what it promises, who it serves, and what it assumes about other people.</p><p>This fictional brief shows one way I would approach that work. Change an editorial choice and inspect what follows.</p></div>
      </div>

      <div className="studio-context-line"><span className="studio-example-label">ORIGINAL ILLUSTRATIVE EXAMPLE</span><p>Fictional workshop details, created to make the editorial choices inspectable.</p></div>

      <div className="studio-workspace">
        <div className="studio-document-column">
          <details className="studio-brief">
            <summary><span><span className="studio-small-label">01 / THE SOURCE BRIEF</span><strong>Start with what is known.</strong></span><span className="studio-brief-toggle" aria-hidden="true">+</span></summary>
            <div className="studio-brief-body"><p>{studioBrief.scenario}</p><ul>{studioBrief.facts.map(fact => <li key={fact}>{fact}</li>)}</ul><p className="studio-brief-boundary">{studioBrief.boundary}</p></div>
          </details>

          <article className="studio-document" aria-labelledby="studio-document-title">
            <div className="studio-document-topline"><span>02 / THE WORKING MESSAGE</span><span>REVIEW {result.appliedCount} / 3</span></div>
            <div className="studio-document-copy" id="studio-message">
              <p className="studio-document-recipient">{review.audience ? (audience === 'leadership' ? 'TO / ACADEMIC & COMMUNICATION LEADS' : 'TO / FAMILIES') : 'TO / AN UNDEFINED AUDIENCE'}</p>
              <h3 id="studio-document-title">{result.subject}</h3>
              <div className="studio-passages">{result.passages.map((passage, index) => <div className={`studio-passage${passage.reviewed ? ' is-reviewed' : ''}`} key={passage.id}><div className="studio-passage-note"><span aria-hidden="true">0{index + 1}</span><span>{passage.label}</span></div><p>{passage.text}</p></div>)}</div>
            </div>
            <div className="studio-document-footer"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3v13h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.2" /></svg><p>Words shape expectations. Review is part of the work.</p></div>
          </article>
        </div>

        <div className="studio-review-column">
          <div className="studio-review-heading"><p className="studio-small-label">03 / THE EDITORIAL DECISIONS</p><h3>Change the reasoning.<br />Watch the message change.</h3></div>
          <div className="studio-review-controls" role="group" aria-label="Apply editorial review decisions">
            {reviewChoices.map((choice, index) => <div className={`studio-choice${review[choice.id] ? ' is-applied' : ''}`} key={choice.id}>
              <button type="button" className="studio-choice-button" aria-pressed={review[choice.id]} aria-controls="studio-message studio-verdict" aria-describedby={`studio-reason-${choice.id}`} onClick={() => toggle(choice.id)}><span className="studio-choice-number" aria-hidden="true">0{index + 1}</span><span>{choice.title}</span><span className="studio-choice-check" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="1.4" /></svg></span></button>
              <div className="studio-choice-reason" id={`studio-reason-${choice.id}`}><p className="studio-choice-question">{choice.question}</p><p>{choice.reason}</p>{review[choice.id] && <p className="studio-consequence"><strong>What changes</strong>{choice.consequence}</p>}</div>
              {choice.id === 'audience' && <fieldset className="studio-audience"><legend>Whose decision are we supporting?</legend><label><input type="radio" name="studio-audience" value="families" checked={review.audience && audience === 'families'} onChange={() => chooseAudience('families')} /><span>Families</span></label><label><input type="radio" name="studio-audience" value="leadership" checked={review.audience && audience === 'leadership'} onChange={() => chooseAudience('leadership')} /><span>School leadership</span></label></fieldset>}
            </div>)}
          </div>
          <button className="studio-reset" type="button" onClick={reset}>Reset the example<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5a6 6 0 1 1-1 7M5 1v5H1" stroke="currentColor" strokeWidth="1.2" /></svg></button>
        </div>
      </div>

      <div className={`studio-verdict${result.readyForReview ? ' is-ready' : ''}`} id="studio-verdict" role="status" aria-atomic="true"><div className="studio-verdict-title"><span className="studio-verdict-mark" aria-hidden="true" /><div><p className="studio-small-label">04 / THE NEXT HUMAN DECISION</p><h3>{result.status}</h3></div></div><div className="studio-verdict-detail"><p>{result.nextDecision}</p><p className="studio-review-count">{result.appliedCount} of 3 editorial changes applied{result.remaining.length > 0 && ` · Still open: ${result.remaining.join(', ')}`}</p></div></div>

      <div className="studio-closing"><p>The point is a clearer decision, with a person responsible for what happens next.</p><a href="#contact">Bring a real brief<StudioArrow /></a></div>
    </div>
  </section>;
}
