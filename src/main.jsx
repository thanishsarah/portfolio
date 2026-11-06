import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BrandMark from './BrandMark';
import ProjectArtwork from './ProjectArtwork';
import { profile, projects, experience, education } from './content';
import './styles.css';
import AIIntegration from './AIIntegration';
import CurriculumShowcase from './CurriculumShowcase';
import InternationalCurriculum from './InternationalCurriculum';

function Arrow({ diagonal = false, ...props }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
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
    setEnabled(previous => { const next = !previous; try { localStorage.setItem('vt-motion', next ? 'on' : 'off'); } catch { /* Optional storage. */ } return next; });
  }
  return { allowed: enabled && !reduced && visible, enabled, reduced, toggle };
}

function PracticeDiagram() {
  return <div className="practice-diagram" aria-hidden="true">
    <svg viewBox="0 0 540 380" fill="none" className="practice-lines">
      <g stroke="#d8dde0" strokeWidth=".8"><path d="M40 60H500M40 190H500M40 320H500M140 20V360M270 20V360M400 20V360" /><circle cx="270" cy="190" r="134" strokeDasharray="2 6" /><circle cx="270" cy="190" r="84" /></g>
      <g stroke="#3156df" strokeWidth="1.4"><path d="M270 190 270 60M270 190 70 190M270 190 470 190M270 190 270 320" /></g>
      <path className="diagram-arc" d="M174 95a134 134 0 0 1 192 190" stroke="#68806d" strokeWidth="2" />
      <circle cx="270" cy="190" r="45" fill="#14283b" />
      <g fill="#f4f3ed" transform="translate(230 150)"><path d="M10 15H19L32 49L45 15H54L36.4 63H27.6L10 15Z" /><path d="M45 15H71V23H61V49H53V23H44L45 15Z" /><circle cx="57" cy="61" r="4.5" /></g>
      <g fill="#fff" stroke="#c7cfd5"><rect x="210" y="39" width="120" height="42" rx="21" /><rect x="12" y="169" width="116" height="42" rx="21" /><rect x="408" y="169" width="124" height="42" rx="21" /><rect x="192" y="299" width="156" height="42" rx="21" /></g>
      <g fill="#172129" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12"><text x="270" y="65">Education</text><text x="70" y="195">Content</text><text x="470" y="195">Communication</text><text x="270" y="325">Brand &amp; growth</text></g>
      <circle className="diagram-seed" cx="174" cy="95" r="5" fill="#3156df" /><circle cx="366" cy="285" r="4" fill="#68806d" />
    </svg>
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
  const links = project.links || (project.url ? [{ label: 'Explore the public context', url: project.url }] : []);
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onCancel={event => { event.preventDefault(); dismiss(); }} onClick={event => { if (event.target === event.currentTarget) dismiss(); }}>
    <button className="close-dialog" onClick={dismiss} aria-label="Close project details"><span aria-hidden="true">×</span></button>
    <div className={`dialog-art artwork-${project.kind}`}><ProjectArtwork kind={project.kind} /></div>
    <div className="dialog-content">
      <p className="eyebrow">PUBLIC WORK OVERVIEW / {project.category}</p>
      <h2 id="project-title">{project.title}</h2>
      {project.role && <div className="project-role"><span>MY ROLE</span><p>{project.role}</p></div>}
      <p>{project.details}</p>
      <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      {links.length > 0 && <div className="project-related-links">{links.map(link => <a className="text-link" key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <Arrow diagonal /></a>)}</div>}
      <p className="dialog-caption">{project.evidence} · Original portfolio illustration</p>
    </div>
  </dialog>;
}

const pathways = {
  leadership: { label: 'Leadership opportunities', title: 'Bring a connected perspective to the team.', description: 'For senior roles connecting AI adoption, educational transformation, content operations, and institutional communication—in India or internationally.', cta: 'Discuss a leadership role', subject: 'Leadership opportunity — AI integration & education transformation' },
  advisory: { label: 'Consulting & advisory', title: 'Start with a focused brief.', description: 'For conversations about a defined AI workflow, team enablement, curriculum communication, or a brand and content challenge.', cta: 'Discuss an advisory brief', subject: 'Advisory enquiry — AI integration, content & communications' },
};

function App() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [intent, setIntent] = useState('leadership');
  const [copied, setCopied] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const trigger = useRef(null);
  const progress = useRef(null);
  const copyTimer = useRef(null);
  const motion = useMotion();
  const categories = ['All', ...new Set(projects.map(project => project.category))];
  const filtered = projects.filter(project => filter === 'All' || project.category === filter);
  const pathway = pathways[intent];

  useEffect(() => { document.title = `${profile.name} — AI Integration & Education Transformation`; }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id); }, { rootMargin: '-12% 0px -55% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    let frame;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const distance = document.documentElement.scrollHeight - innerHeight; if (progress.current) progress.current.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`; }); };
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
    return () => { observer.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (!menuOpen) return;
    function close(event) { if (event.key === 'Escape') { setMenuOpen(false); document.querySelector('.menu-toggle')?.focus(); } }
    addEventListener('keydown', close); return () => removeEventListener('keydown', close);
  }, [menuOpen]);

  function openProject(project, element) { trigger.current = element; setSelected(project); }
  function closeProject() { setSelected(null); trigger.current?.focus(); }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopied('Email copied'); } catch { setCopied('Please use the email link'); }
    clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(''), 3000);
  }

  return <div className="portfolio" data-motion={motion.allowed ? 'on' : 'off'}>
    <div className="reading-progress" ref={progress} aria-hidden="true" />
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header container">
      <a className="wordmark" href="#home" aria-label={`${profile.name}, home`}><BrandMark className="brand-mark" /><span>{profile.name}<small>AI · EDUCATION · COMMUNICATIONS</small></span></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      <nav id="main-nav" className={`navigation${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">{[['ai-integration', 'AI integration'], ['work', 'Selected work'], ['curriculum', 'Curriculum'], ['international', 'International'], ['about', 'About']].map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s connect <Arrow diagonal /></a></nav>
    </header>

    <main id="main">
      <section id="home" className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> A CONNECTED PRACTICE / VINAYAK THANISH</p>
          <h1 id="hero-title">AI integration.<br /><em>Human direction.</em></h1>
          <p className="hero-description">{profile.introduction}</p>
          <p className="hero-support">Education is my foundation. Content, communication, and people are how the work takes shape.</p>
          <div className="hero-actions"><a className="button button-primary" href="#ai-integration">Explore my AI practice <Arrow diagonal /></a><a className="hero-secondary" href="#work">See the work <span aria-hidden="true">↓</span></a></div>
          <p className="hero-location">BASED IN DELHI NCR <span>↔</span> INDIA & INTERNATIONAL CONVERSATIONS</p>
        </div>
        <aside className="practice-panel" aria-label="A connected practice in education, content, communication, and brand">
          <div className="practice-panel-header"><span>THE CONNECTED PRACTICE</span><span className="panel-index">VT / 01</span></div>
          <PracticeDiagram />
          <div className="practice-panel-footer"><p>Connect the work.<br /><strong>Keep people in the loop.</strong></p><BrandMark /></div>
        </aside>
      </section>

      <div className="positioning-band"><div className="container"><p>ONE PRACTICE.<br /><strong>CONNECTED CAPABILITIES.</strong></p><span>AI adoption</span><i aria-hidden="true" /><span>Learning systems</span><i aria-hidden="true" /><span>Creative communication</span></div></div>

      <AIIntegration />

      <section id="work" className="work-section" aria-labelledby="work-title"><div className="container">
        <div className="section-heading"><div><p className="eyebrow">02 / SELECTED EVIDENCE</p><h2 id="work-title">The work behind<br /><em>the perspective.</em></h2></div><p>Curriculum, enablement, frameworks, and leadership.<br />Public overviews of work with a wider context.</p></div>
        <div className="work-toolbar"><div className="filters" role="group" aria-label="Filter projects">{categories.map(category => <button key={category} className={`filter${filter === category ? ' active' : ''}`} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div><span className="project-count" role="status">{String(filtered.length).padStart(2, '0')} WORK OVERVIEWS</span></div>
        <div className="project-grid">{filtered.map(project => <article className="project-card" key={project.id} id={project.id}>
          <div className={`project-image artwork-${project.kind}`}><ProjectArtwork kind={project.kind} /><span className="art-caption">{project.artworkLabel || 'Project illustration'}</span></div>
          <div className="project-content"><p className="project-category">{project.category}</p><h3>{project.title}</h3><p className="project-description" id={`${project.id}-description`}>{project.description}</p><div className="case-scope"><span>SCOPE</span><p>{project.scope}</p></div><button className="project-open" aria-label={`View ${project.title} project details`} aria-describedby={`${project.id}-description`} onClick={event => openProject(project, event.currentTarget)}>Read the work overview <Arrow diagonal /></button><p className="case-evidence">{project.evidence}</p></div>
        </article>)}</div>
        <div className="evidence-note"><span className="evidence-note-mark" aria-hidden="true">↗</span><p><strong>Depth, with discretion.</strong> Original curriculum and institutional documents remain confidential. These overviews explain my role and focus without exposing the source material.</p><a href="#contact">Discuss the context <Arrow diagonal /></a></div>
      </div></section>

      <CurriculumShowcase />
      <InternationalCurriculum />

      <section id="experience" className="experience-section container" aria-labelledby="experience-title"><div className="journey-intro"><p className="eyebrow">05 / EXPERIENCE & CONTEXT</p><h2 id="experience-title">A practice built<br /><em>across disciplines.</em></h2><p>Academic operations, creative media, and learning design inform how I approach change.</p><a className="text-link" href="#about">Meet the person <Arrow /></a></div><div className="experience-list">{experience.map((item, index) => <details className="experience-item" key={item.organization} open={index === 0}><summary><span className="experience-period">{item.period}{index === 0 && <span className="current-label">CURRENT</span>}</span><h3>{item.organization}</h3><span className="experience-role">{item.role}</span><span className="experience-toggle" aria-hidden="true">+</span></summary><div className="experience-description"><p>{item.description}</p>{item.remit && <p className="experience-remit"><strong>Current remit</strong>{item.remit}</p>}</div></details>)}</div></section>

      <section id="about" className="about-section" aria-labelledby="about-title"><div className="container"><div className="about-layout"><div className="about-heading"><p className="eyebrow">06 / THE PERSON & THE PRACTICE</p><h2 id="about-title">Grounded in education.<br /><em>Built for connection.</em></h2><div className="about-monogram" aria-hidden="true"><BrandMark /><span>VINAYAK THANISH<br />A CONNECTED PERSPECTIVE</span></div></div><div className="about-copy"><p className="about-intro">{profile.about}</p><p>Computer applications gave me a systems lens. Filmmaking gave me a narrative lens. Education and communication bring those ways of thinking into contact with people.</p><h3 className="skills-label">Capabilities & focus</h3><div className="interests">{profile.interests.map(interest => <span key={interest}>{interest}</span>)}</div></div></div><div className="education"><p className="eyebrow">EDUCATION / FOUNDATIONS</p><div className="education-grid">{education.map(item => <div className="education-item" key={item.institution}><p className="education-qualification">{item.qualification}</p><p className="education-institution">{item.institution}</p><span className="education-period">{item.period}</span></div>)}</div></div></div></section>

      <section id="contact" className="contact-section container" aria-labelledby="contact-title">
        <div className="contact-heading"><div><p className="eyebrow">07 / THE NEXT CONVERSATION</p><h2 id="contact-title">A role to shape.<br /><em>A challenge to work on.</em></h2></div><p>For senior leadership opportunities and focused advisory conversations.<br /><span>India and international.</span></p></div>
        <div className="contact-pathway"><div className="contact-intents" role="group" aria-label="Choose your conversation">{Object.entries(pathways).map(([id, item]) => <button key={id} aria-pressed={intent === id} onClick={() => setIntent(id)}>{item.label}<Arrow diagonal /></button>)}</div><div className="contact-intent-detail" aria-live="polite"><p className="eyebrow">{intent === 'leadership' ? 'LEADERSHIP FIRST' : 'A DEFINED ADVISORY BRIEF'}</p><h3>{pathway.title}</h3><p>{pathway.description}</p><a className="button button-primary" href={`mailto:${profile.email}?subject=${encodeURIComponent(pathway.subject)}`}>{pathway.cta}<Arrow diagonal /></a></div></div>
        <div className="direct-contact"><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="copy-email" onClick={copyEmail} aria-label="Copy email address">{copied || 'Copy email'}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="1.5" /></svg></button><span className="sr-only" role="status">{copied}</span></div>
      </section>
    </main>

    <footer className="site-footer container"><a className="footer-brand" href="#home" aria-label={`${profile.name}, back to top`}><BrandMark /><span>{profile.name}<small>AI INTEGRATION. HUMAN DIRECTION.</small></span></a><p>© {new Date().getFullYear()} · {profile.location}</p><div className="footer-utilities"><button className="motion-toggle" onClick={motion.toggle} aria-pressed={motion.enabled && !motion.reduced} disabled={motion.reduced} aria-label={motion.reduced ? 'Motion reduced by your system preference' : `Motion ${motion.enabled ? 'on' : 'off'}`}><span aria-hidden="true">{motion.allowed ? '◉' : '○'}</span>{motion.reduced ? 'Motion reduced' : `Motion ${motion.enabled ? 'on' : 'off'}`}</button><a href="#home" aria-label="Back to top"><Arrow diagonal /></a></div></footer>
    {selected && <ProjectDialog project={selected} onClose={closeProject} />}
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
