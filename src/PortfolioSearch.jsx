import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { searchPortfolio, searchTypeLabels } from './portfolio-search';
import './portfolio-search.css';

function SearchGlyph() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export default function PortfolioSearch({ onOpenCase, onNavigate, onChooseLens }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const dialog = useRef(null);
  const input = useRef(null);
  const trigger = useRef(null);
  const previousFocus = useRef(null);
  const identity = useId();
  const titleId = `portfolio-search-title-${identity}`;
  const listId = `portfolio-search-results-${identity}`;
  const hintId = `portfolio-search-hint-${identity}`;
  const results = useMemo(() => searchPortfolio(query), [query]);
  const selected = Math.min(active, Math.max(0, results.length - 1));

  function openSearch() {
    if (document.querySelector('dialog[open]')) return;
    previousFocus.current = document.activeElement;
    setQuery(''); setActive(0); setOpen(true);
  }

  function closeSearch() {
    dialog.current?.close();
    setOpen(false);
    const prior = previousFocus.current;
    const destination = prior?.isConnected && !['BODY', 'HTML', 'DIALOG'].includes(prior.tagName) && prior.getClientRects().length ? prior : trigger.current;
    destination?.focus?.({ preventScroll: true });
  }

  function choose(item) {
    if (!item) return;
    closeSearch();
    if (item.type === 'case') onOpenCase?.(item.target);
    else if (item.type === 'lens') onChooseLens?.(item.target);
    else if (item.type === 'curriculum') onNavigate?.('curriculum', { query: item.label });
    else onNavigate?.(item.target);
  }

  useEffect(() => {
    function shortcut(event) {
      if (event.repeat || event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      if (!open && document.querySelector('dialog[open]')) return;
      event.preventDefault();
      if (open) closeSearch(); else openSearch();
    }
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, [open]);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    input.current?.focus();
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, listId, selected, query]);

  function handleKeys(event) {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(value => results.length ? (value + 1) % results.length : 0); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(value => results.length ? (value - 1 + results.length) % results.length : 0); }
    else if (event.key === 'Home' && !event.shiftKey) { event.preventDefault(); setActive(0); }
    else if (event.key === 'End' && !event.shiftKey) { event.preventDefault(); setActive(Math.max(0, results.length - 1)); }
    else if (event.key === 'Enter') { event.preventDefault(); choose(results[selected]); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeSearch(); }
  }

  return <>
    <button ref={trigger} type="button" className="portfolio-search-trigger" aria-label="Search portfolio" aria-keyshortcuts="Control+K Meta+K" aria-haspopup="dialog" onClick={openSearch}><SearchGlyph /><span>Search</span><kbd aria-hidden="true">K</kbd></button>
    {open && createPortal(<dialog ref={dialog} className="portfolio-search-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); closeSearch(); }} onClick={event => { if (event.target === event.currentTarget) closeSearch(); }}>
      <div className="portfolio-search-heading"><div><p>THE PUBLIC PORTFOLIO / FIND</p><h2 id={titleId}>Find a connection.</h2></div><button type="button" className="portfolio-search-close" aria-label="Close portfolio search" onClick={closeSearch}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.4" /></svg></button></div>
      <div className="portfolio-search-input-wrap"><SearchGlyph /><input ref={input} type="search" role="combobox" aria-label="Search public portfolio" aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={results.length ? `${listId}-${selected}` : undefined} aria-describedby={hintId} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={handleKeys} maxLength={160} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false" placeholder="Work, learning topics, or a place to begin…" />{query && <button type="button" className="portfolio-search-clear" onClick={() => { setQuery(''); setActive(0); input.current?.focus(); }} aria-label="Clear portfolio search">Clear</button>}</div>
      <div className="portfolio-search-results-heading"><p>{query.trim() ? 'MATCHING CONNECTIONS' : 'PLACES TO BEGIN'}</p><p role="status">{results.length ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'No matching results'}</p></div>
      <ul id={listId} role="listbox" aria-label="Portfolio search results" className="portfolio-search-results">{results.map((item, index) => <li key={item.id} id={`${listId}-${index}`} role="option" aria-selected={selected === index} className={selected === index ? 'is-active' : ''} onMouseDown={event => event.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => choose(item)}><div><span className="portfolio-search-kind">{searchTypeLabels[item.type]}</span><strong>{item.label}</strong><span className="portfolio-search-detail">{item.detail}</span></div><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" /></svg></li>)}</ul>
      {!results.length && <div className="portfolio-search-empty"><p>No connection found for that search.</p><span>Try “AI”, “curriculum”, “privacy”, or “filmmaking”.</span></div>}
      <div className="portfolio-search-footer"><p id={hintId}>Only public work and overviews are searched.</p><p><kbd>Up / Down</kbd> navigate <kbd>Enter</kbd> open <kbd>Esc</kbd> close</p></div>
    </dialog>, document.body)}
  </>;
}
