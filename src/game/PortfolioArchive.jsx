import React, { useEffect, useId, useRef, useState } from 'react';
import { profile, experience, education } from '../content';
import { caseStudies } from '../case-studies';
import { publicCurricula } from '../curriculum';
import { internationalPractice } from '../international';
import { aiPractice } from '../ai-practice';
import './archive.css';

const tabs = [
  ['overview', 'Overview'], ['work', 'Selected work'], ['curriculum', 'Learning'],
  ['career', 'Career'], ['contact', 'Contact'],
];
const caseSignals = { 'media-shala': 'learning', 'kedman-global': 'communication', 'paryavaran-baal-sansad': 'communication', 'ai-literacy': 'ai' };

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

function OrbitIcon() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth=".8" /><ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(-34 32 32)" stroke="currentColor" strokeWidth="1.2" /><circle cx="32" cy="32" r="4" fill="currentColor" /><circle cx="54" cy="17" r="3" fill="currentColor" /></svg>;
}

export default function PortfolioArchive({ open, onClose, initialTab = 'overview', initialCaseId = null, recovered = [] }) {
  const [tab, setTab] = useState('overview');
  const [caseId, setCaseId] = useState(caseStudies[0].id);
  const [query, setQuery] = useState('');
  const [intent, setIntent] = useState('leadership');
  const [brief, setBrief] = useState('');
  const [contactCaseId, setContactCaseId] = useState(null);
  const [copyNote, setCopyNote] = useState('');
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const priorFocus = useRef(null);
  const content = useRef(null);
  const copyTimer = useRef(null);
  const tabButtons = useRef({});
  const identity = useId().replaceAll(':', '');
  const titleId = `archive-title-${identity}`;
  const panelId = `archive-panel-${identity}`;
  const activeCase = caseStudies.find(item => item.id === caseId) || caseStudies[0];
  const search = query.trim().toLocaleLowerCase();
  const topics = publicCurricula.filter(item => !search || [item.title, item.category, item.summary, ...item.focus].join(' ').toLocaleLowerCase().includes(search));

  useEffect(() => {
    if (!open) return;
    setTab(tabs.some(([id]) => id === initialTab) ? initialTab : 'overview');
    if (caseStudies.some(item => item.id === initialCaseId)) setCaseId(initialCaseId);
    setCopyNote('');
  }, [open, initialTab, initialCaseId]);

  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    priorFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (!element.open) element.showModal();
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      const destination = priorFocus.current;
      if (destination?.isConnected) destination.focus?.({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (open && content.current) content.current.scrollTop = 0;
  }, [open, tab, caseId]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function dismiss() {
    if (dialog.current?.open) dialog.current.close();
    onClose?.();
  }
  function changeTab(id) {
    setTab(id); setCopyNote('');
    requestAnimationFrame(() => tabButtons.current[id]?.focus({ preventScroll: true }));
  }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopyNote('Email address copied.'); }
    catch { setCopyNote('Use the email link, or select the address to copy.'); }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyNote(''), 4000);
  }
  const contactCase = caseStudies.find(item => item.id === contactCaseId);
  const purpose = intent === 'leadership' ? 'a leadership opportunity' : 'a focused advisory engagement';
  const mailBody = `Hello Vinayak,\n\nI would like to discuss ${purpose}.\n${contactCase ? `\nWork I explored: ${contactCase.shortTitle}.\n` : ''}${brief.trim() ? `\nThe challenge: ${brief.trim()}\n` : ''}\nOrganisation / team:\nLocation / working arrangement:\nA useful next conversation would be:`;
  const mailSubject = intent === 'leadership' ? 'Leadership opportunity — education, communication & AI' : 'Advisory enquiry — education, communication & AI';
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  return <dialog ref={dialog} className="portfolio-archive" aria-labelledby={titleId} onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape' && !event.nativeEvent.isComposing) { event.preventDefault(); dismiss(); } }} onCancel={event => { event.preventDefault(); dismiss(); }} onClick={event => { if (event.target === event.currentTarget) dismiss(); }}>
    <div className="archive-shell">
      <header className="archive-header"><div className="archive-header-title"><OrbitIcon /><div><p className="archive-kicker">THE SIGNAL ATLAS / PORTFOLIO ARCHIVE</p><h2 id={titleId}>{profile.name}</h2><p className="archive-subtitle">Education · Communication · AI integration</p></div></div><button ref={closeButton} className="archive-close" type="button" onClick={dismiss} aria-label="Close portfolio archive"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.4" /></svg><span>Return to flight</span></button></header>
      <nav className="archive-tabs" aria-label="Portfolio archive sections">{tabs.map(([id, label]) => <button key={id} ref={element => { tabButtons.current[id] = element; }} type="button" aria-pressed={tab === id} aria-controls={panelId} onClick={() => changeTab(id)}>{label}</button>)}</nav>
      <div id={panelId} ref={content} className="archive-content" role="region" aria-label={`${tabs.find(([id]) => id === tab)?.[1]} archive`}>
        {tab === 'overview' && <div className="archive-overview"><div className="archive-lead"><p className="archive-kicker">THE PERSON BEHIND THE SIGNALS</p><h3>Turning complexity into<br /><em>shared capability.</em></h3><p>{profile.about}</p><div className="archive-location"><span aria-hidden="true" /><span className="archive-location-place">{profile.location}</span><span className="archive-location-separator" aria-hidden="true">/</span><span className="archive-location-reach">India & international opportunities</span></div></div><section className="archive-current" aria-labelledby={`archive-current-${identity}`}><div><p className="archive-kicker">CURRENT REMIT / INTEGRATION IN PROGRESS</p><h4 id={`archive-current-${identity}`}>AI integration across the whole story.</h4><p>{profile.introduction}</p></div><div className="archive-contexts"><p className="archive-small-label">WORKING CONTEXTS</p><ul>{aiPractice.context.map(item => <li key={item.name}>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}<Arrow /></a> : item.name}</li>)}</ul></div></section><div className="archive-streams">{aiPractice.workstreams.map((stream, index) => <article key={stream.id}><span className="archive-index">0{index + 1}</span><h4>{stream.title}</h4><p>{stream.summary}</p><p className="archive-human-review"><strong>Human judgement</strong>{stream.review}</p></article>)}</div><div className="archive-overview-actions"><button type="button" onClick={() => changeTab('work')}>Examine selected work<Arrow /></button><button type="button" onClick={() => changeTab('contact')}>Start a conversation<Arrow /></button></div></div>}

        {tab === 'work' && <div className="archive-work"><div className="archive-section-intro"><p className="archive-kicker">FOUR CONTEXTS / RESPONSIBILITY & EVIDENCE</p><h3>The work behind the signals.</h3><p>Explore each account at any time. Flight discoveries mark the connections you have visited.</p></div><div className="archive-case-layout"><div className="archive-case-list" role="group" aria-label="Choose a work account">{caseStudies.map((item, index) => <button key={item.id} type="button" aria-pressed={activeCase.id === item.id} aria-controls={`archive-case-${identity}`} onClick={() => setCaseId(item.id)}><span className="archive-index">0{index + 1}</span><span><strong>{item.shortTitle}</strong><small>{item.status}</small>{recovered.includes(caseSignals[item.id]) && <small className="archive-recovered">Signal recovered</small>}</span><Arrow /></button>)}</div><article className="archive-case" id={`archive-case-${identity}`} aria-labelledby={`archive-case-title-${identity}`}><div className="archive-case-topline"><span>{activeCase.status}</span><span>PUBLIC WORK ACCOUNT</span></div><h4 id={`archive-case-title-${identity}`}>{activeCase.title}</h4><p className="archive-case-summary">{activeCase.summary}</p><dl className="archive-case-remit"><div><dt>MY RESPONSIBILITY</dt><dd>{activeCase.role}</dd></div><div><dt>SCOPE</dt><dd>{activeCase.scope}</dd></div></dl><p>{activeCase.context}</p><div className="archive-contribution"><p className="archive-small-label">{activeCase.contributionTitle}</p><ul>{activeCase.contribution.map(item => <li key={item}>{item}</li>)}</ul></div><blockquote><p className="archive-small-label">THE QUESTION BEHIND THE WORK</p><p>{activeCase.question}</p></blockquote><div className="archive-case-care"><div><p className="archive-small-label">PEOPLE & CONTEXT</p><p>{activeCase.people}</p></div><div><p className="archive-small-label">WHAT NEEDS CARE</p><p>{activeCase.constraint}</p></div></div><div className="archive-evidence"><p className="archive-small-label">{activeCase.evidence.label}</p><p>{activeCase.evidence.summary}</p><p>{activeCase.evidence.boundary}</p><div>{activeCase.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div></div><button className="archive-inline-action" type="button" onClick={() => { setContactCaseId(activeCase.id); changeTab('contact'); }}>Discuss this context<Arrow /></button></article></div></div>}

        {tab === 'curriculum' && <div className="archive-learning"><div className="archive-section-intro"><p className="archive-kicker">LEARNING / PUBLIC OVERVIEWS</p><h3>Knowledge that carries forward.</h3><p>Curriculum and framework contributions across media literacy, creative practice, and responsible technology. Original lesson plans and institutional documents remain private.</p></div><label className="archive-search-label" htmlFor={`archive-search-${identity}`}>Search public curriculum overviews</label><div className="archive-search"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.4" /></svg><input id={`archive-search-${identity}`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Storytelling, privacy, filmmaking…" autoComplete="off" maxLength={120} aria-controls={`archive-topics-${identity}`} />{query && <button type="button" onClick={() => setQuery('')}>Clear</button>}</div><p className="archive-result-count" role="status">{topics.length} public {topics.length === 1 ? 'overview' : 'overviews'}</p><div className="archive-topics" id={`archive-topics-${identity}`}>{topics.map(item => <article key={item.id}><p className="archive-small-label">{item.category} / {item.scope}</p><h4>{item.title}</h4><p>{item.summary}</p><ul>{item.focus.map(focus => <li key={focus}>{focus}</li>)}</ul></article>)}</div>{!topics.length && <p className="archive-empty">No matching overview. Try another topic or clear the search.</p>}<section className="archive-international" aria-labelledby={`archive-international-${identity}`}><p className="archive-kicker">INTERNATIONAL PERSPECTIVES</p><h4 id={`archive-international-${identity}`}>{internationalPractice.title}</h4><p>{internationalPractice.introduction}</p><div>{internationalPractice.areas.map(area => <article key={area.title}><h5>{area.title}</h5><p>{area.summary}</p></article>)}</div></section></div>}

        {tab === 'career' && <div className="archive-career"><div className="archive-section-intro"><p className="archive-kicker">THE PROFESSIONAL RECORD</p><h3>Systems. Perspective. People.</h3><p>A computer applications foundation, formal filmmaking education, and professional experience across academic operations, curriculum, communication, and practical AI adoption.</p></div><div className="archive-career-list">{experience.map(item => <article key={item.organization}><div className="archive-career-period">{item.period}</div><div><h4>{item.organization}</h4><p className="archive-career-role">{item.role}</p><p>{item.description}</p>{item.remit && <p>{item.remit}</p>}{item.highlights && <ul>{item.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>}</div></article>)}</div><section className="archive-education" aria-labelledby={`archive-education-${identity}`}><p className="archive-kicker">EDUCATION / FOUNDATIONS</p><h4 id={`archive-education-${identity}`}>Two ways of seeing.</h4>{education.map(item => <article key={item.institution}><p className="archive-small-label">{item.period}</p><h5>{item.qualification}</h5><p>{item.institution}</p></article>)}</section></div>}

        {tab === 'contact' && <div className="archive-contact"><div className="archive-section-intro"><p className="archive-kicker">THE NEXT CONNECTION</p><h3>What needs to become possible?</h3><p>For senior leadership opportunities and focused advisory work, in India and internationally.</p></div><div className="archive-contact-layout"><div>{contactCase && <div className="archive-selected-context"><p><span>WORK YOU EXPLORED</span>{contactCase.shortTitle}</p><button type="button" onClick={() => setContactCaseId(null)}>Clear context</button></div>}<fieldset className="archive-intent"><legend>Choose a conversation</legend>{[['leadership', 'Leadership opportunity'], ['advisory', 'Focused advisory work']].map(([id, label]) => <button key={id} type="button" aria-pressed={intent === id} onClick={() => setIntent(id)}>{label}<Arrow /></button>)}</fieldset><label className="archive-brief-label" htmlFor={`archive-brief-${identity}`}>What are you trying to change?<span>Optional · a sentence about the people, learning, or communication challenge.</span></label><textarea id={`archive-brief-${identity}`} value={brief} onChange={event => setBrief(event.target.value)} maxLength={1200} rows={5} placeholder="The challenge you have in mind…" /><p className="archive-local-note">Your draft stays in this page until you choose to open your email app.</p>{brief && <button className="archive-clear-brief" type="button" onClick={() => setBrief('')}>Clear this draft</button>}</div><div className="archive-message"><p className="archive-small-label">YOUR CONVERSATION BRIEF</p><p className="archive-message-recipient">To: {profile.email}</p><pre aria-label="Email brief preview">{mailBody}</pre><a className="archive-primary-action" href={mailto}>Open email with this brief<Arrow /></a><p>Review and send from your own email app.</p></div></div><div className="archive-direct-contact"><a href={`mailto:${profile.email}`}>{profile.email}</a><button type="button" onClick={copyEmail}>Copy email address</button><p role="status" aria-live="polite">{copyNote}</p></div></div>}
      </div>
      <footer className="archive-footer"><span><i aria-hidden="true" />PUBLIC PORTFOLIO / ALL RECORDS AVAILABLE</span><p>Explore the work anytime.</p></footer>
    </div>
  </dialog>;
}
