import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectArtwork from './ProjectArtwork';
import { profile, projects, experience, education } from './content';
import './styles.css';

function Arrow({ diagonal = false, ...props }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function ProjectDialog({ project, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  function dismiss() {
    dialog.current.close();
    onClose();
  }
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onCancel={(event) => { event.preventDefault(); dismiss(); }} onClick={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
    <button className="close-dialog" onClick={dismiss} aria-label="Close project details">×</button>
    <div className={`dialog-art artwork-${project.kind}`}><ProjectArtwork kind={project.kind} /></div>
    <div className="dialog-content">
      <p className="eyebrow">{project.category}{project.sample && ' · Sample concept'}</p>
      <h2 id="project-title">{project.title}</h2>
      <p>{project.details}</p>
      <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      {project.url && <a className="text-link" href={project.url} target="_blank" rel="noreferrer">Visit project <Arrow diagonal /></a>}
    </div>
  </dialog>;
}

function App() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const projectTrigger = useRef(null);
  const categories = ['All', ...new Set(projects.map(project => project.category))];
  const filtered = projects.filter(project => filter === 'All' || project.category === filter);

  useEffect(() => { document.title = `${profile.name} — Portfolio`; }, []);

  function closeProject() {
    setSelected(null);
    projectTrigger.current?.focus();
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header container">
      <a className="wordmark" href="#home" aria-label={`${profile.name}, home`}>
        <span className="brand-symbol" aria-hidden="true">✳</span>{profile.name}<span className="wordmark-dot">.</span>
      </a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      <nav id="main-nav" className={menuOpen ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">
        <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
        <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>Let’s talk <Arrow diagonal /></a>
      </nav>
    </header>

    <main id="main">
      <section id="home" className="hero container" aria-labelledby="hero-title">
        <div className="hero-main">
          <p className="eyebrow"><span className="tiny-dot" /> Education · Media · Future skills</p>
          <h1 id="hero-title">Learning starts<br />with <span className="curiosity">curiosity<svg viewBox="0 0 410 26" aria-hidden="true"><path d="M5 16C110 2 263 1 404 11M32 23C152 12 275 9 365 17" /></svg></span><span className="title-dot">.</span></h1>
          <p className="hero-description">{profile.introduction}</p>
          <a className="button button-dark" href="#work">Explore my work <Arrow /></a>
        </div>
        <div className="hero-aside">
          <div className="curiosity-object" aria-hidden="true">
            <span className="object-orbit orbit-one" /><span className="object-orbit orbit-two" /><span className="object-orbit orbit-three" />
            <span className="object-core" /><span className="object-satellite" />
            <span className="object-caption">LEARNING, REIMAGINED</span>
            <svg className="object-spark" viewBox="0 0 50 50"><path d="M25 0v50M0 25h50M7 7l36 36M7 43 43 7" /></svg>
          </div>
          <div className="hero-note"><span className="note-line" /><p>Human-first.<br />Future-focused.</p></div>
        </div>
        <div className="hero-bottom"><span>{profile.role}</span><a href="#work">Scroll to discover <span aria-hidden="true">↓</span></a></div>
      </section>

      <section id="work" className="work-section container" aria-labelledby="work-title">
        <div className="section-heading"><div><p className="eyebrow">01 / Ideas into impact</p><h2 id="work-title">Selected initiatives<span className="title-dot">.</span></h2></div><p>Curriculum, creative technology,<br />and learning that lasts.</p></div>
        <div className="work-toolbar">
          <div className="filters" role="group" aria-label="Filter projects">{categories.map(category => <button key={category} className={filter === category ? 'filter active' : 'filter'} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div>
          <span className="project-count" role="status">{String(filtered.length).padStart(2, '0')} projects</span>
        </div>
        <div className="project-grid">{filtered.map((project, index) => <article className="project-card" key={project.id}>
          <button className="project-open" aria-label={`View ${project.title} project details`} aria-describedby={`${project.id}-description${project.sample || project.artworkLabel ? ` ${project.id}-sample` : ''}`} onClick={(event) => { projectTrigger.current = event.currentTarget; setSelected(project); }}>
            <div className={`project-image artwork-${project.kind}`}>
              {(project.sample || project.artworkLabel) && <span id={`${project.id}-sample`} className="sample-label">{project.sample ? 'Sample concept' : project.artworkLabel}</span>}
              <ProjectArtwork kind={project.kind} />
              <span className="project-arrow"><Arrow diagonal /></span>
            </div>
          </button>
          <div className="project-info"><div><h3>{project.title}</h3><p id={`${project.id}-description`}>{project.description}</p></div><span className="project-index">{String(index + 1).padStart(2, '0')}</span></div>
          <div className="project-category">{project.category}<span aria-hidden="true"> / </span>{project.tags[0]}</div>
        </article>)}</div>
      </section>

      <section id="experience" className="experience-section container" aria-labelledby="experience-title">
        <div className="section-heading"><div><p className="eyebrow">02 / The journey so far</p><h2 id="experience-title">A broader perspective<span className="title-dot">.</span></h2></div><p>Across classrooms, campuses,<br />and creative communities.</p></div>
        <ol className="experience-list">{experience.map(item => <li className="experience-item" key={`${item.organization}-${item.period}`}><p className="experience-period">{item.period}</p><div><h3>{item.role}</h3><p className="experience-organization">{item.organization}</p><p className="experience-description">{item.description}</p></div><Arrow diagonal /></li>)}</ol>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-title"><div className="container about-layout">
        <div><p className="eyebrow">03 / A little about me</p><h2 id="about-title">Creative thinking.<br />Purposeful learning.</h2><div className="about-doodle" aria-hidden="true">✳<span>Still learning.<br />Always making.</span></div><p className="location"><span className="tiny-dot" />{profile.location}</p></div>
        <div className="about-copy"><p className="about-intro">{profile.about}</p><p>My background brings together computer applications, practical filmmaking, and academic affairs. I connect creative practice with educational frameworks to help educators and learners navigate a changing world.</p><div className="interests">{profile.interests.map(interest => <span key={interest}><span aria-hidden="true">↗</span>{interest}</span>)}</div><div className="education"><h3>Education</h3>{education.map(item => <div className="education-item" key={item.institution}><p className="education-qualification">{item.qualification}</p><p>{item.institution} <span>· {item.period}</span></p></div>)}</div></div>
      </div></section>

      <section id="contact" className="contact-section container" aria-labelledby="contact-title"><p className="eyebrow">04 / What’s next?</p><div className="contact-heading"><h2 id="contact-title">Let’s shape what<br /><span>learning can become.</span></h2><span className="contact-star" aria-hidden="true">✳</span></div>
        <div className="contact-bottom"><p>Curriculum collaborations, educator training,<br />and conversations about the future.</p>{profile.email ? <a className="button button-dark" href={`mailto:${profile.email}`}>Say hello <Arrow diagonal /></a> : <p className="contact-placeholder"><span className="tiny-dot" />Contact details coming soon</p>}</div>
      </section>
    </main>
    <footer className="site-footer container"><a className="footer-name" href="#home">{profile.name}<span className="wordmark-dot">.</span></a><p>© {new Date().getFullYear()} · Made with curiosity.</p><div className="footer-links">{profile.socialLinks.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <Arrow diagonal /></a>)}<a href="#home">Back to top <span aria-hidden="true">↑</span></a></div></footer>
    {selected && <ProjectDialog project={selected} onClose={closeProject} />}
  </>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
