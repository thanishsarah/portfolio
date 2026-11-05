import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BrandMark from './BrandMark';
import ProjectArtwork from './ProjectArtwork';
import { profile, projects, experience, education } from './content';
import './styles.css';
import CurriculumShowcase from './CurriculumShowcase';
import InternationalCurriculum from './InternationalCurriculum';

const lenses = [
  { id: 'curriculum', label: 'Curriculum', word: 'Imagine.', number: '01', description: 'Big possibilities. Real classrooms. Future skills made tangible across seven schools.', caption: 'From possibility to practice', project: 'media-shala' },
  { id: 'literacy', label: 'AI literacy', word: 'Question.', number: '02', description: 'Creative tools need critical minds. Helping educators make, verify, and think for themselves.', caption: 'Human judgement at the centre', project: 'ai-literacy' },
  { id: 'strategy', label: 'Strategy', word: 'Connect.', number: '03', description: 'A learning ecosystem is more than its parts. Connecting people, programs, and future possibilities.', caption: 'Seeing the whole system', project: 'kedman-global' },
];

function Arrow({ diagonal = false, ...props }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function useMotion() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem('vt-motion') !== 'off'; } catch { return true; }
  });
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    const visibility = () => setVisible(!document.hidden);
    preference.addEventListener('change', change);
    document.addEventListener('visibilitychange', visibility);
    return () => { preference.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem('vt-motion', next ? 'on' : 'off'); } catch { /* Storage is optional. */ }
  }
  return { allowed: enabled && !reduced && visible, enabled, reduced, toggle };
}

function LearningMap({ active, onChange, onExplore, motion }) {
  const map = useRef(null);
  const frame = useRef(null);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  useEffect(() => {
    if (!motion && map.current) { cancelAnimationFrame(frame.current); map.current.style.setProperty('--drift-x', '0px'); map.current.style.setProperty('--drift-y', '0px'); }
  }, [motion]);
  function move(event) {
    if (!motion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 12;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => { map.current?.style.setProperty('--drift-x', `${x}px`); map.current?.style.setProperty('--drift-y', `${y}px`); });
  }
  function reset() {
    cancelAnimationFrame(frame.current);
    map.current?.style.setProperty('--drift-x', '0px'); map.current?.style.setProperty('--drift-y', '0px');
  }
  return <div className="learning-system" ref={map} onPointerMove={move} onPointerLeave={reset} data-lens={active.id}>
    <div className="system-topline"><span>THE LIVING CURRICULUM</span><span className="system-indicator"><i /> INTERACTIVE STUDY</span></div>
    <div className="map-surface">
      <svg className="map-geometry" viewBox="0 0 600 500" fill="none" aria-hidden="true">
        <defs><radialGradient id="map-glow"><stop stopColor="#dbf994" stopOpacity=".11" /><stop offset="1" stopColor="#dbf994" stopOpacity="0" /></radialGradient></defs>
        <circle cx="300" cy="250" r="230" fill="url(#map-glow)" />
        <g className="map-grid" stroke="currentColor" strokeWidth=".5"><path d="M0 125H600M0 250H600M0 375H600M150 0V500M300 0V500M450 0V500" /><circle cx="300" cy="250" r="188" /><circle cx="300" cy="250" r="125" /><path d="M90 40 510 460M90 460 510 40" /></g>
        <g className="map-orbits" stroke="currentColor" strokeWidth="1"><ellipse cx="300" cy="250" rx="230" ry="112" transform="rotate(-31 300 250)" /><ellipse cx="300" cy="250" rx="202" ry="167" transform="rotate(25 300 250)" /></g>
        <g className="map-connections" stroke="#dbf994" strokeWidth="1.2"><path className="connection connection-curriculum" d="M300 250 336 84" /><path className="connection connection-literacy" d="M300 250 105 295" /><path className="connection connection-strategy" d="M300 250 486 365" /></g>
        <g className="map-seeds" fill="#dbf994"><circle cx="171" cy="112" r="3" /><circle cx="465" cy="160" r="2" /><circle cx="235" cy="423" r="2" /></g>
        <g stroke="#8faaa0" strokeWidth="1"><path d="M42 57h12m-6-6v12M545 435h12m-6-6v12" /></g>
      </svg>
      <div className="system-core"><BrandMark /><span>VT</span></div>
      <div className="map-nodes" role="group" aria-label="Explore learning connections">{lenses.map(lens => <button key={lens.id} className={`map-node node-${lens.id}${active.id === lens.id ? ' is-active' : ''}`} aria-label={lens.label} aria-pressed={active.id === lens.id} aria-controls="lens-summary" onClick={() => onChange(lens)}><span className="node-dot" /><span className="node-index">{lens.number}</span><span className="node-label">{lens.label}</span></button>)}</div>
      <span className="map-coordinate coordinate-top">DELHI NCR / INDIA</span><span className="map-coordinate coordinate-bottom">PEOPLE ↔ POSSIBILITIES</span>
    </div>
    <div className="lens-summary" id="lens-summary"><div aria-live="polite" aria-atomic="true"><span className="lens-number">{active.number} / {active.caption}</span><p key={active.id}>{active.word}</p><span className="lens-description">{active.description}</span></div><button className="map-explore" onClick={() => onExplore(active.project)} aria-label={`Explore ${active.label} initiative`}><Arrow diagonal /></button></div>
  </div>;
}

function ProjectDialog({ project, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = previous; };
  }, []);
  function dismiss() { dialog.current.close(); onClose(); }
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onCancel={event => { event.preventDefault(); dismiss(); }} onClick={event => { if (event.target === event.currentTarget) dismiss(); }}>
    <button className="close-dialog" onClick={dismiss} aria-label="Close project details"><span aria-hidden="true">×</span></button>
    <div className={`dialog-art artwork-${project.kind}`}><ProjectArtwork kind={project.kind} /></div>
    <div className="dialog-content"><p className="eyebrow">FIELD NOTE / {project.category}</p><h2 id="project-title">{project.title}</h2><p>{project.details}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{project.url && <a className="text-link" href={project.url} target="_blank" rel="noreferrer">Visit project <Arrow diagonal /></a>}<p className="dialog-caption">Illustration created for this portfolio.</p></div>
  </dialog>;
}

function App() {
  const [lens, setLens] = useState(lenses[0]);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const trigger = useRef(null);
  const progress = useRef(null);
  const copyTimer = useRef(null);
  const motion = useMotion();
  const categories = ['All', ...new Set(projects.map(project => project.category))];
  const filtered = projects.filter(project => filter === 'All' || project.category === filter);

  useEffect(() => { document.title = `${profile.name} — Learning, made alive.`; }, []);
  useEffect(() => {
    const sections = [...document.querySelectorAll('main > section[id]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('has-entered'); setActiveSection(entry.target.id); } });
    }, { rootMargin: '-12% 0px -50% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - innerHeight;
        if (progress.current) progress.current.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
      });
    };
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
    return () => { observer.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = event => { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle')?.focus(); } };
    addEventListener('keydown', close); return () => removeEventListener('keydown', close);
  }, [menuOpen]);

  function openProject(project, element) { trigger.current = element || document.activeElement; setSelected(project); }
  function closeProject() { setSelected(null); trigger.current?.focus(); }
  function explore(id) { const project = projects.find(item => item.id === id); if (project) openProject(project); }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopied('Email copied'); }
    catch { setCopied('Please use the email link'); }
    clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(''), 3000);
  }

  return <div className="portfolio" data-motion={motion.allowed ? 'on' : 'off'}>
    <div className="reading-progress" ref={progress} aria-hidden="true" />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header container">
      <a className="wordmark" href="#home" aria-label={`${profile.name}, home`}><BrandMark className="brand-mark" /><span>{profile.name.split(' ')[0]}<br /><strong>{profile.name.split(' ').slice(1).join(' ')}</strong></span></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      <nav id="main-nav" className={`navigation${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">{[['work', 'Selected work'], ['curriculum', 'Curriculum'], ['international', 'International'], ['experience', 'Journey'], ['about', 'About']].map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s connect <Arrow diagonal /></a></nav>
    </header>

    <main id="main">
      <section id="home" className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> EDUCATION, WITH A HUMAN PERSPECTIVE</p><h1 id="hero-title">Learning,<br />made <em>alive</em><span className="heading-seed" aria-hidden="true" /></h1><p className="hero-description">{profile.introduction}</p><div className="hero-actions"><a className="button button-lime" href="#work">Explore my work <Arrow diagonal /></a><span className="hero-signature">A curious mind.<br />A considered approach.</span></div><div className="hero-identity"><span>{profile.name}</span><p>{profile.role}</p></div></div>
        <LearningMap active={lens} onChange={setLens} onExplore={explore} motion={motion.allowed} />
        <div className="hero-bottom"><span>BASED IN {profile.location.toUpperCase()}</span><span>CREATIVE EDUCATION / HUMAN-CENTRED SYSTEMS</span><a href="#work" aria-label="Scroll to selected work"><span aria-hidden="true">↓</span> SCROLL TO EXPLORE</a></div>
      </section>

      <div className="manifesto-strip" aria-label="Think, make, question, connect"><div className="container"><span>Think.</span><BrandMark /><span>Make.</span><BrandMark /><span>Question.</span><BrandMark /><span>Connect.</span></div></div>

      <section id="work" className="work-section light-section" aria-labelledby="work-title"><div className="container">
        <div className="section-heading"><div><p className="eyebrow">01 / SELECTED FIELD NOTES</p><h2 id="work-title">Ideas are just the start.<br /><em>Here’s what takes shape.</em></h2></div><p>Curriculum. Critical thinking. Connection.<br />A selection of work in education.</p></div>
        <div className="work-toolbar"><div className="filters" role="group" aria-label="Filter projects">{categories.map(category => <button key={category} className={`filter${filter === category ? ' active' : ''}`} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div><span className="project-count" role="status">{String(filtered.length).padStart(2, '0')} INITIATIVES</span></div>
        <div className="project-grid">{filtered.map((project, index) => <article className={`project-card${index === 0 ? ' project-card-featured' : ''}`} key={project.id}>
          <div className={`project-image artwork-${project.kind}`}><ProjectArtwork kind={project.kind} /><span className="art-caption">{project.artworkLabel || 'Project illustration'}</span></div>
          <div className="project-content"><p className="project-category"><span>{String(projects.indexOf(project) + 1).padStart(2, '0')}</span> / {project.category}</p><h3>{project.title}</h3><p className="project-description" id={`${project.id}-description`}>{project.description}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><button className="project-open" aria-label={`View ${project.title} project details`} aria-describedby={`${project.id}-description`} onClick={event => openProject(project, event.currentTarget)}>Explore the initiative <span><Arrow diagonal /></span></button></div>
        </article>)}</div>
      </div></section>

      <CurriculumShowcase />
      <InternationalCurriculum />

      <section id="experience" className="experience-section light-section" aria-labelledby="experience-title"><div className="container experience-layout"><div className="journey-intro"><p className="eyebrow">04 / AN EVOLVING PRACTICE</p><h2 id="experience-title">Different places.<br /><em>One connecting thread.</em></h2><p>Helping people learn, create,<br />and see what’s possible.</p><div className="journey-mark" aria-hidden="true"><BrandMark /><span>ALWAYS<br />BECOMING.</span></div></div><div className="experience-list">{experience.map((item, index) => <details className="experience-item" key={item.organization} open={index === 0}><summary><span className="experience-period">{item.period}{index === 0 && <span className="current-label">CURRENT</span>}</span><h3>{item.organization}</h3><span className="experience-role">{item.role}</span><span className="experience-toggle" aria-hidden="true"><i /><i /></span></summary><div className="experience-description"><p>{item.description}</p></div></details>)}</div></div></section>

      <section id="about" className="about-section" aria-labelledby="about-title"><div className="container"><div className="about-layout"><div className="about-heading"><p className="eyebrow">05 / THE PERSON BEHIND THE PRACTICE</p><h2 id="about-title">A human<br /><em>perspective.</em></h2><div className="about-symbol" aria-hidden="true"><BrandMark /><span>VT / AN OPEN MIND</span></div></div><div className="about-copy"><p className="about-intro">{profile.about}</p><p>My background brings together computer applications, practical filmmaking, and academic affairs. I connect creative practice with educational frameworks to help educators and learners navigate a changing world.</p><h3 className="skills-label">Skills & focus</h3><div className="interests">{profile.interests.map(interest => <span key={interest}><span className="interest-dot" />{interest}</span>)}</div></div></div><div className="education"><p className="eyebrow">FOUNDATIONS / EDUCATION</p><div className="education-grid">{education.map((item, index) => <div className="education-item" key={item.institution}><span className="education-number">0{index + 1}</span><div><p className="education-qualification">{item.qualification}</p><p className="education-institution">{item.institution}</p><span className="education-period">{item.period}</span></div></div>)}</div></div></div></section>

      <section id="contact" className="contact-section container" aria-labelledby="contact-title"><div className="contact-intro"><p className="eyebrow">06 / THE NEXT CONNECTION</p><span className="contact-location"><span className="status-dot" /> {profile.location}</span></div><h2 id="contact-title">What could we<br /><em>make possible?</em><span className="contact-mark" aria-hidden="true"><BrandMark /></span></h2><div className="contact-bottom"><p>Curriculum collaborations. Educator training.<br />Conversations that lead somewhere new.</p><div className="contact-actions"><a className="button button-lime" href={`mailto:${profile.email}`}>Say hello <Arrow diagonal /></a><button className="copy-email" onClick={copyEmail} aria-label="Copy email address"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.5" /></svg><span>{copied || 'Copy email'}</span></button><span className="sr-only" role="status">{copied}</span></div></div></section>
    </main>

    <footer className="site-footer container"><a className="footer-brand" href="#home" aria-label={`${profile.name}, back to top`}><BrandMark /><span>{profile.name}<span>LEARNING, MADE ALIVE.</span></span></a><p>© {new Date().getFullYear()} · A considered work in progress.</p><div className="footer-utilities"><button className="motion-toggle" onClick={motion.toggle} aria-pressed={motion.enabled && !motion.reduced} disabled={motion.reduced} aria-label={motion.reduced ? 'Motion reduced by your system preference' : `Motion ${motion.enabled ? 'on' : 'off'}`}><span className="motion-icon" aria-hidden="true"><i /><i /><i /></span>{motion.reduced ? 'Motion reduced' : `Motion ${motion.enabled ? 'on' : 'off'}`}</button><a href="#home" aria-label="Back to top"><Arrow diagonal /></a></div></footer>
    {selected && <ProjectDialog project={selected} onClose={closeProject} />}
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
