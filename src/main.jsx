import './experience.css';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BrandMark from './BrandMark';
import PracticeAtlas from './PracticeAtlas';
import CaseExplorer from './CaseExplorer';
import DecisionStudio from './DecisionStudio';
import AIRemit from './AIRemit';
import CurriculumShowcase from './CurriculumShowcase';
import InternationalCurriculum from './InternationalCurriculum';
import { profile, experience, education } from './content';
import { caseStudies } from './case-studies';
import { getPracticeLens, buildConversationBrief } from './practice-model';

function Arrow({ diagonal = false, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function useMotion() {
  const [enabled, setEnabled] = useState(() => { try { return localStorage.getItem('vt-motion') !== 'off'; } catch { return true; } });
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    const visibility = () => setVisible(!document.hidden);
    preference.addEventListener('change', change); document.addEventListener('visibilitychange', visibility);
    return () => { preference.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  function toggle() {
    setEnabled(previous => { const next = !previous; try { localStorage.setItem('vt-motion', next ? 'on' : 'off'); } catch { /* The preference is optional. */ } return next; });
  }
  return { allowed: enabled && !reduced && visible, enabled, reduced, toggle };
}

function FieldDrawing({ lensId }) {
  const index = { adoption: 0, learning: 1, communication: 2 }[lensId] || 0;
  return <svg className="origin-drawing" viewBox="0 0 480 500" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth=".6" opacity=".18"><path d="M40 84h400M40 250h400M40 416h400M74 44v412M240 44v412M406 44v412" /><circle cx="240" cy="250" r="166" /><circle cx="240" cy="250" r="116" strokeDasharray="2 5" /></g>
    <g stroke="currentColor" strokeWidth=".8" opacity=".28">{Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${74 + i * 9.22} ${416 - i * 18.44}L${406 - i * 9.22} ${416 - i * 18.44}`} />)}</g>
    <g className="origin-structure" stroke="currentColor" strokeWidth="1.1"><path d="M74 416 240 84 406 416H74Z" /><path d="m124 316 116-232 116 232H124Z" /><path d="M174 216h132M240 84v332" /></g>
    <path d={['M74 416 240 84 356 316','M124 316 240 84 406 416','M174 216 240 84 406 416'][index]} stroke="#c5a36d" strokeWidth="2" />
    <circle cx="240" cy="84" r="7" fill="#c5a36d" /><circle cx="240" cy="84" r="16" stroke="#c5a36d" strokeWidth=".8" />
    <circle cx="74" cy="416" r="4" fill="currentColor" /><circle cx="406" cy="416" r="4" fill="currentColor" />
    <g fill="currentColor" fontFamily="monospace" fontSize="9" letterSpacing="1"><text x="240" y="53" textAnchor="middle">INTENTION</text><text x="44" y="443">PEOPLE</text><text x="436" y="443" textAnchor="end">PRACTICE</text></g>
    <text x="240" y="480" textAnchor="middle" fill="#c5a36d" fontFamily="monospace" fontSize="8" letterSpacing="2">A SHARED LANGUAGE. ROOM TO GROW.</text>
  </svg>;
}

const navigation = [['practice', 'The connections'], ['work', 'The work'], ['decision-studio', 'The judgement'], ['background', 'The person']];

function App() {
  const [lensId, setLensId] = useState('adoption');
  const [selectedCase, setSelectedCase] = useState('ai-literacy');
  const [visitedCases, setVisitedCases] = useState([]);
  const [demoSeen, setDemoSeen] = useState(false);
  const [explorationVersion, setExplorationVersion] = useState(0);
  const [intent, setIntent] = useState('leadership');
  const [challenge, setChallenge] = useState('');
  const [copied, setCopied] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const progress = useRef(null);
  const copyTimer = useRef(null);
  const libraryRef = useRef(null);
  const motion = useMotion();
  const lens = getPracticeLens(lensId);
  const explored = visitedCases.map(id => caseStudies.find(item => item.id === id)).filter(Boolean);
  const brief = buildConversationBrief({ lensId, intent, challenge, demoSeen, caseTitles: explored.map(item => item.shortTitle || item.title) });
  const mailSubject = intent === 'leadership' ? `Leadership conversation — ${lens.title}` : `Advisory conversation — ${lens.title}`;
  const mailLink = `mailto:${profile.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(brief)}`;

  useEffect(() => { document.title = `${profile.name} — AI Integration, Education & Communication`; }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id); }, { rootMargin: '-10% 0px -60% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    let frame;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const distance = document.documentElement.scrollHeight - innerHeight; if (progress.current) progress.current.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`; }); };
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
    return () => { observer.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) setVisitedCases(previous => previous.includes(selectedCase) ? previous : [...previous, selectedCase]); }, { threshold: .55 });
    const section = document.getElementById('case-title');
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, [selectedCase]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (!menuOpen) return;
    function close(event) { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.experience-menu')?.focus(); } }
    addEventListener('keydown', close); return () => removeEventListener('keydown', close);
  }, [menuOpen]);
  useEffect(() => {
    function revealLibrary() {
      if (['#curriculum', '#international'].includes(location.hash)) {
        const details = document.querySelector(`${location.hash}`)?.closest('details');
        if (details) details.open = true;
        requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'instant', block: 'start' }));
      }
    }
    revealLibrary(); addEventListener('hashchange', revealLibrary);
    return () => removeEventListener('hashchange', revealLibrary);
  }, []);

  function goTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
    requestAnimationFrame(() => {
      const heading = target.querySelector('h2,h3') || target;
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: motion.allowed ? 'smooth' : 'instant', block: 'start' });
    });
  }
  function selectLens(id) { setLensId(id); setSelectedCase(getPracticeLens(id).caseIds[0]); }
  function openCase(id) { setSelectedCase(id); setVisitedCases(previous => previous.includes(id) ? previous : [...previous, id]); goTo('work'); }
  function selectCase(id) { setSelectedCase(id); setVisitedCases(previous => previous.includes(id) ? previous : [...previous, id]); goTo('case-dossier'); }
  function discussCase(item) { setSelectedCase(item.id); setVisitedCases(previous => previous.includes(item.id) ? previous : [...previous, item.id]); goTo('contact'); }
  async function copy(value, label) {
    try { await navigator.clipboard.writeText(value); setCopied(label); } catch { setCopied('Select the text to copy, or use the email link.'); }
    clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(''), 4000);
  }
  function resetRoute() { setLensId('adoption'); setSelectedCase('ai-literacy'); setVisitedCases([]); setDemoSeen(false); setChallenge(''); setIntent('leadership'); setCopied(''); setExplorationVersion(previous => previous + 1); }

  return <div className="portfolio experience-site" data-motion={motion.allowed ? 'on' : 'off'}>
    <div className="reading-progress" ref={progress} aria-hidden="true" />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="experience-header container">
      <a className="experience-brand" href="#home" aria-label={`${profile.name}, home`}><BrandMark /><span>Vinayak Thanish<small>EDUCATION / COMMUNICATION / AI</small></span></a>
      <button className="experience-menu" type="button" aria-expanded={menuOpen} aria-controls="experience-navigation" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      <nav id="experience-navigation" className={menuOpen ? 'experience-navigation is-open' : 'experience-navigation'} aria-label="Main navigation">{navigation.map(([id, label]) => <a href={`#${id}`} key={id} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="header-contact" href="#contact" onClick={() => setMenuOpen(false)}>Start a conversation <Arrow diagonal /></a></nav>
    </header>

    <main id="main">
      <section id="home" className="experience-hero" aria-labelledby="hero-title"><div className="container">
        <div className="hero-folio"><p>THE PRACTICE OF VINAYAK THANISH</p><span>DELHI NCR / INDIA & INTERNATIONAL</span></div>
        <div className="hero-composition"><div className="hero-statement"><p className="hero-role">AI INTEGRATION · LEARNING SYSTEMS · CREATIVE COMMUNICATION</p><h1 id="hero-title">Turning complexity<br />into <em>shared<br className="hero-break" /> capability.</em></h1><p className="hero-proposition">I connect learning, communication, and AI into work people can understand, use, and carry forward.</p><div className="experience-hero-actions"><a className="experience-button" href="#practice">Find the connection <Arrow /></a><a className="experience-text-link" href="#work">Examine the work <Arrow diagonal /></a></div></div><div className="hero-origin"><FieldDrawing lensId={lensId} /><p>One idea becomes useful when<br /><strong>other people can make it their own.</strong></p></div></div>
        <div className="hero-current"><p className="micro-label">CURRENT FOCUS</p><p>Leading AI integration across content, communications, brand marketing, and business promotion within the Manav Rachna education ecosystem.</p><a href="#ai-integration">Explore the remit <Arrow diagonal /></a></div>
      </div></section>

      <PracticeAtlas lensId={lensId} onLensChange={selectLens} onOpenCase={openCase} visitedCases={visitedCases} />

      <div className="route-thread"><div className="container"><span className="micro-label">YOUR CURRENT LENS</span><strong>{lens.title}</strong><span className="route-thread-line" aria-hidden="true" /><a href="#work">Follow the evidence <Arrow /></a><a href="#practice" aria-label="Change your exploration lens">Change lens</a></div></div>

      <CaseExplorer selectedId={selectedCase} onSelect={selectCase} onDiscuss={discussCase} />
      <DecisionStudio key={explorationVersion} onExplore={() => setDemoSeen(true)} />
      <AIRemit />

      <section id="library" className="supporting-library" aria-labelledby="library-title" ref={libraryRef}><div className="container"><div className="library-introduction"><p className="eyebrow">04 / THE KNOWLEDGE BEHIND THE WORK</p><h2 id="library-title">Knowledge should<br /><em>carry forward.</em></h2><p>Curriculum design is part of the foundation: media literacy, storytelling, digital citizenship, and the ability to see a subject from another perspective.</p></div><div className="library-disclosures"><details className="library-disclosure"><summary><span><small>PUBLIC CURRICULUM INDEX</small><strong>Ten connected areas of learning</strong></span><span className="disclosure-indicator" aria-hidden="true">+</span></summary><div className="library-contents"><CurriculumShowcase /></div></details><details className="library-disclosure"><summary><span><small>INTERNATIONAL PERSPECTIVES</small><strong>Frameworks, inquiry, and communication</strong></span><span className="disclosure-indicator" aria-hidden="true">+</span></summary><div className="library-contents"><InternationalCurriculum /></div></details></div><p className="library-boundary">These are public summaries of my contribution. Original lesson plans and institutional documents remain confidential.</p></div></section>

      <section id="background" className="background-section" aria-labelledby="background-title"><div className="container"><div className="background-intro" id="about"><div><p className="eyebrow">05 / THE PERSON IN THE CONNECTIONS</p><h2 id="background-title">A technical foundation.<br />A filmmaker’s perspective.<br /><em>An educator’s responsibility.</em></h2></div><div className="background-description"><p>I’m Vinayak Thanish. Computer applications taught me to look for systems. Filmmaking taught me to look for perspective. Education brings both into a relationship with people.</p><p>That combination shapes my work across curriculum, academic operations, creative communication, educator development, and practical AI adoption.</p><div className="background-signature"><BrandMark /><span>VINAYAK THANISH<br />DELHI NCR, INDIA</span></div></div></div><div className="career-record" id="experience"><div className="record-label"><p className="micro-label">THE PROFESSIONAL RECORD</p><p>Formal roles and the experience<br />behind the practice.</p></div><div className="career-items">{experience.map((item, index) => <details key={item.organization} className="career-item" open={index === 0}><summary><span className="career-period">{item.period}</span><span className="career-position"><strong>{item.organization}</strong><span>{item.role}</span></span><span className="career-toggle" aria-hidden="true">+</span></summary><div className="career-description"><p>{item.description}</p>{item.remit && <p>{item.remit}</p>}</div></details>)}</div></div><div className="education-record"><p className="micro-label">EDUCATION / TWO WAYS OF SEEING</p>{education.map(item => <div key={item.institution}><span>{item.period}</span><h3>{item.qualification}</h3><p>{item.institution}</p></div>)}</div></div></section>

      <section id="contact" className="conversation-section" aria-labelledby="contact-title"><div className="container"><div className="conversation-intro"><p className="eyebrow">06 / FROM CONNECTION TO CONVERSATION</p><h2 id="contact-title">What needs to<br /><em>become possible?</em></h2><p>For senior leadership opportunities and focused advisory work.<br />India and international.</p></div><div className="conversation-workspace"><div className="conversation-questions"><fieldset><legend>What kind of conversation?</legend><div className="conversation-intents">{[['leadership', 'Leadership opportunity'], ['advisory', 'Focused advisory work']].map(([id, label]) => <button type="button" key={id} aria-pressed={intent === id} onClick={() => setIntent(id)}>{label}<Arrow diagonal /></button>)}</div></fieldset><label htmlFor="conversation-challenge">What are you trying to change?<span>Optional · add a sentence to shape the conversation.</span></label><textarea id="conversation-challenge" value={challenge} onChange={event => setChallenge(event.target.value)} maxLength={1200} rows={4} placeholder="The people, process, or learning challenge you have in mind…" /><p className="conversation-local">Your draft stays in this page until you choose to copy it or open your email app.</p><div className="route-memory"><p className="micro-label">THE CONNECTIONS YOU EXPLORED</p><p className="route-memory-lens">{lens.title}</p>{explored.length > 0 ? <ul>{explored.map(item => <li key={item.id}><button type="button" onClick={() => openCase(item.id)}>{item.shortTitle || item.title}<Arrow diagonal /></button></li>)}</ul> : <p className="route-memory-empty">Choose a case to bring its context into the brief.</p>}{demoSeen && <p className="route-memory-demo">Illustrative communication review explored</p>}<button type="button" className="route-reset" onClick={resetRoute}>Reset this exploration</button></div></div><div className="conversation-brief"><div className="brief-topline"><span>YOUR CONVERSATION BRIEF</span><span aria-hidden="true">VT / NOTE</span></div><p className="brief-recipient">To: <a href={`mailto:${profile.email}`}>{profile.email}</a></p><pre aria-label="Conversation brief preview">{brief}</pre><div className="brief-actions"><a className="experience-button" href={mailLink}>Open email with this brief <Arrow diagonal /></a><button type="button" onClick={() => copy(brief, 'Conversation brief copied')}>Copy the brief <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M15 8V4H4v12h4" stroke="currentColor" strokeWidth="1.3" /></svg></button></div><p className="brief-send-note">Review and send from your own email app.</p></div></div><div className="conversation-direct"><a href={`mailto:${profile.email}`}>{profile.email}</a><button type="button" onClick={() => copy(profile.email, 'Email address copied')}>Copy email address</button><p role="status" aria-live="polite">{copied}</p></div></div></section>
    </main>

    <footer className="experience-footer container"><a className="footer-identity" href="#home"><BrandMark /><span>Vinayak Thanish<small>THE WORK IS CONNECTED.</small></span></a><p>© {new Date().getFullYear()} · Delhi NCR, India</p><div><button type="button" className="motion-toggle" onClick={motion.toggle} aria-pressed={motion.enabled && !motion.reduced} disabled={motion.reduced} aria-label={motion.reduced ? 'Motion reduced by your system preference' : `Motion ${motion.enabled ? 'on' : 'off'}`}>{motion.reduced ? 'Motion reduced' : `Motion ${motion.enabled ? 'on' : 'off'}`}</button><a href="#home" aria-label="Back to top"><Arrow /></a></div></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
