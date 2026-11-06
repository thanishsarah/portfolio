import React, { useEffect, useRef, useState } from 'react';
import { publicCurricula } from './curriculum';
import { profile } from './content';
import './curriculum.css';

function CurriculumGlyph({ index = 0, className = '' }) {
  return <svg className={`curriculum-glyph ${className}`} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
    {index % 4 === 0 ? <>
      <path d="M12 48 32 12l20 36H12Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M22 48 32 30l10 18M22 30h20" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="32" cy="12" r="3" fill="currentColor" />
    </> : index % 4 === 1 ? <>
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="32" cy="32" rx="10" ry="20" stroke="currentColor" strokeWidth="1.2" transform="rotate(38 32 32)" />
      <path d="M12 32h40" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="49" cy="21" r="3" fill="currentColor" />
    </> : index % 4 === 2 ? <>
      <path d="M14 16h20v20H14zM30 30h20v20H30z" stroke="currentColor" strokeWidth="1.2" />
      <path d="m14 50 36-36M14 50h9m-9 0v-9" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="50" cy="14" r="3" fill="currentColor" />
    </> : <>
      <path d="M12 42c0-13 9-24 20-24s20 11 20 24M12 42h40M22 42c0-10 4-18 10-18s10 8 10 18M32 12v40" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="32" cy="52" r="3" fill="currentColor" />
    </>}
  </svg>;
}

function CurriculumArrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CurriculumOverview({ item, index, onClose }) {
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

  const enquiry = `mailto:${profile.email}?subject=${encodeURIComponent(`Curriculum enquiry — ${item.title}`)}`;

  return <dialog ref={dialog} className="curriculum-dialog" aria-labelledby="curriculum-overview-title" onCancel={event => { event.preventDefault(); dismiss(); }} onClick={event => { if (event.target === event.currentTarget) dismiss(); }}>
    <button type="button" className="curriculum-close" aria-label="Close curriculum overview" onClick={dismiss}><span aria-hidden="true">×</span></button>
    <div className="curriculum-dialog-heading">
      <CurriculumGlyph index={index} />
      <p className="curriculum-kicker">PUBLIC OVERVIEW / {item.category}</p>
      <h2 id="curriculum-overview-title">{item.title}</h2>
      <p className="curriculum-dialog-scope">{item.scope}</p>
    </div>
    <div className="curriculum-dialog-body">
      <p className="curriculum-dialog-summary">{item.summary}</p>
      <h3 className="curriculum-focus-heading">Areas of focus</h3>
      <ul className="curriculum-focus-list">{item.focus.map(label => <li key={label}><span aria-hidden="true" />{label}</li>)}</ul>
      <div className="curriculum-dialog-discretion"><span className="curriculum-small-seed" aria-hidden="true" /><p>This is a public overview. Full lesson plans and programme documents are kept private and shared separately, following a direct conversation.</p></div>
      <a className="curriculum-enquiry" href={enquiry}>Discuss this curriculum <CurriculumArrow /></a>
    </div>
  </dialog>;
}

export default function CurriculumShowcase() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const trigger = useRef(null);
  const search = useRef(null);
  const categories = ['All', ...new Set(publicCurricula.map(item => item.category))];
  const searchTerm = query.trim().toLocaleLowerCase();
  const results = publicCurricula.filter(item => {
    const matchesCategory = category === 'All' || item.category === category;
    const publicText = [item.title, item.summary, ...item.focus].join(' ').toLocaleLowerCase();
    return matchesCategory && (!searchTerm || publicText.includes(searchTerm));
  });

  function openOverview(item, element) {
    trigger.current = element;
    setSelected(item);
  }

  function closeOverview() {
    setSelected(null);
    trigger.current?.focus();
  }

  function clearFilters() {
    setQuery('');
    setCategory('All');
    search.current?.focus();
  }

  return <section id="curriculum" className="curriculum-section" aria-labelledby="curriculum-title">
    <div className="container curriculum-container">
      <div className="curriculum-heading">
        <div><p className="curriculum-kicker">03 / CURRICULUM PRACTICE</p><h2 id="curriculum-title">Curriculum,<br /><em>with intention.</em></h2></div>
        <div className="curriculum-heading-note"><CurriculumGlyph index={1} /><p>Considered structures.<br />Room for discovery.</p></div>
      </div>

      <div className="curriculum-notice"><span className="curriculum-small-seed" aria-hidden="true" /><p>Public overviews of my curriculum design. Full lesson plans and programme documents are kept private.</p><span className="curriculum-collection-label">A PUBLIC COLLECTION</span></div>

      <div className="curriculum-tools">
        <div className="curriculum-filters" role="group" aria-label="Filter curriculum overviews by category">{categories.map(label => <button key={label} type="button" className={`curriculum-filter${category === label ? ' curriculum-filter-active' : ''}`} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}</div>
        <div className="curriculum-search-wrap"><label htmlFor="curriculum-search">Search public overviews</label><div className="curriculum-search-field"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg><input ref={search} id="curriculum-search" type="search" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find an area of learning" aria-controls="curriculum-results" /></div></div>
      </div>

      <div className="curriculum-results-heading"><p id="curriculum-result-count" className="curriculum-result-count" role="status">{String(results.length).padStart(2, '0')} public {results.length === 1 ? 'overview' : 'overviews'}</p>{(query || category !== 'All') && <button type="button" className="curriculum-clear" onClick={clearFilters}>Clear filters <span aria-hidden="true">×</span></button>}</div>

      <div className="curriculum-grid" id="curriculum-results">
        {results.map(item => {
          const index = publicCurricula.indexOf(item);
          return <article className="curriculum-card" key={item.id}>
            <div className="curriculum-card-top"><p className="curriculum-card-category"><span>{String(index + 1).padStart(2, '0')}</span> / {item.category}</p><CurriculumGlyph index={index} /></div>
            <p className="curriculum-card-scope">{item.scope}</p>
            <h3>{item.title}</h3>
            <p className="curriculum-card-summary" id={`curriculum-${item.id}-summary`}>{item.summary}</p>
            <button type="button" className="curriculum-open" aria-label={`View public overview: ${item.title}`} aria-describedby={`curriculum-${item.id}-summary`} onClick={event => openOverview(item, event.currentTarget)}>View public overview <span><CurriculumArrow /></span></button>
          </article>;
        })}
      </div>

      {results.length === 0 && <div className="curriculum-empty"><CurriculumGlyph index={3} /><h3>No matching public overviews.</h3><p>Try another topic or clear the filters to explore the collection.</p><button type="button" className="curriculum-reset" onClick={clearFilters}>Clear search and filters <CurriculumArrow /></button></div>}

      <div className="curriculum-discretion"><p>Looking for the full context?<br /><span>Original materials are shared separately, following a direct conversation.</span></p><a href={`mailto:${profile.email}?subject=${encodeURIComponent('Curriculum enquiry')}`}>Let’s discuss your context <CurriculumArrow /></a></div>
    </div>
    {selected && <CurriculumOverview item={selected} index={publicCurricula.indexOf(selected)} onClose={closeOverview} />}
  </section>;
}
