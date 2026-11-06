import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { publicCurricula } from "./curriculum";
import { internationalPractice } from "./international";
import "./knowledge-index.css";

function normalise(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function IndexDrawing({ index = 0 }) {
  const level = index % 3;
  return (
    <svg
      className="knowledge-study"
      viewBox="0 0 350 116"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="knowledge-study-grid"
        d="M12 17H338M12 99H338M26 9V107M324 9V107M175 9V107"
      />
      <path
        className="knowledge-study-path"
        d={`M33 80h45V${48 + level * 6}h49V${24 + level * 4}h96v${24 - level * 4}h49v32h45`}
      />
      <path
        className="knowledge-study-faint"
        d="M54 80V61h46V42h49V24m52 0h23v19h48v18h23v19"
      />
      <path
        className="knowledge-study-line"
        d="M33 80H317M78 48h49M223 48h49"
      />
      <circle cx="33" cy="80" r="5" className="knowledge-study-point" />
      <path className="knowledge-study-jewel" d="m175 17 7 7-7 7-7-7 7-7Z" />
      <circle cx="317" cy="80" r="5" className="knowledge-study-point" />
      <path className="knowledge-study-line" d="M175 31v43m-7-7 7 7 7-7" />
    </svg>
  );
}

const views = [
  { id: "curriculum", label: "Curriculum design" },
  { id: "international", label: "International perspectives" },
];

export default function KnowledgeIndex() {
  const [view, setView] = useState("curriculum");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(publicCurricula[0].id);
  const identity = useId().replaceAll(":", "");
  const searchId = `knowledge-search-${identity}`;
  const tabs = useRef([]);
  const results = useMemo(() => {
    const tokens = normalise(query).split(/\s+/).filter(Boolean);
    return publicCurricula.filter((item) => {
      const text = normalise(
        [
          item.title,
          item.category,
          item.scope,
          item.summary,
          ...item.focus,
        ].join(" "),
      );
      return tokens.every((token) => text.includes(token));
    });
  }, [query]);
  const selected = results.find((item) => item.id === selectedId) || results[0];
  const selectedIndex = selected ? publicCurricula.indexOf(selected) : -1;

  useEffect(() => {
    function reveal(event) {
      const detail = event.detail || {};
      const nextView =
        detail.view === "international" ? "international" : "curriculum";
      setView(nextView);
      if (typeof detail.query === "string") {
        const value = detail.query.slice(0, 160);
        setQuery(value);
        const exact = publicCurricula.find(
          (item) => normalise(item.title) === normalise(value),
        );
        if (exact) setSelectedId(exact.id);
      }
    }
    addEventListener("portfolio:knowledge", reveal);
    return () => removeEventListener("portfolio:knowledge", reveal);
  }, []);

  function switchTab(event, index) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % views.length;
    else if (event.key === "ArrowLeft")
      next = (index + views.length - 1) % views.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = views.length - 1;
    else return;
    event.preventDefault();
    setView(views[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <section
      id="library"
      className="knowledge-section"
      aria-labelledby="knowledge-title"
    >
      <div className="container">
        <div className="knowledge-heading">
          <div>
            <p className="eyebrow">03 / THE KNOWLEDGE BASE</p>
            <h2 id="knowledge-title">
              Knowledge, designed
              <br />
              <em>to travel.</em>
            </h2>
          </div>
          <p>
            My curriculum work connects media literacy, creative practice, and
            responsible technology. Developed and enhanced for K–12 learning
            across seven Manav Rachna schools.
          </p>
        </div>

        <div
          className="knowledge-tabs"
          role="tablist"
          aria-label="Explore educational practice"
        >
          {views.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              id={`knowledge-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              aria-controls={item.id}
              tabIndex={view === item.id ? 0 : -1}
              onClick={() => setView(item.id)}
              onKeyDown={(event) => switchTab(event, index)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {item.label}
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4 10h12m-5-5 5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
          ))}
        </div>

        <div
          id="curriculum"
          className="knowledge-panel"
          role="tabpanel"
          aria-labelledby="knowledge-tab-curriculum"
          hidden={view !== "curriculum"}
        >
          <div className="knowledge-index-layout">
            <div className="knowledge-index-column">
              <div className="knowledge-search-row">
                <label htmlFor={searchId}>Find a learning strand</label>
                <span>{String(results.length).padStart(2, "0")} / 10</span>
              </div>
              <div className="knowledge-search">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="5.2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="m12.5 12.5 4 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the public index"
                  maxLength={160}
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear learning strand search"
                  >
                    ×
                  </button>
                )}
              </div>
              <div
                className="knowledge-topic-list"
                role="group"
                aria-label="Public learning strands"
              >
                {results.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={selected?.id === item.id}
                    aria-controls="knowledge-overview"
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="knowledge-topic-number" aria-hidden="true">
                      {String(publicCurricula.indexOf(item) + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <span>{item.title}</span>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M4 10h12m-5-5 5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              {!results.length && (
                <div className="knowledge-empty">
                  <p>No public overviews match this search.</p>
                  <button type="button" onClick={() => setQuery("")}>
                    Show all ten strands
                  </button>
                </div>
              )}
            </div>

            <div
              id="knowledge-overview"
              className="knowledge-overview"
              aria-live="polite"
              aria-atomic="true"
            >
              {selected ? (
                <>
                  <div className="knowledge-overview-top">
                    <span>PUBLIC OVERVIEW</span>
                    <span>
                      {String(selectedIndex + 1).padStart(2, "0")} / 10
                    </span>
                  </div>
                  <IndexDrawing index={selectedIndex} />
                  <p className="knowledge-category">
                    {selected.category} <span aria-hidden="true">/</span>{" "}
                    {selected.scope}
                  </p>
                  <h3>{selected.title}</h3>
                  <p className="knowledge-summary">{selected.summary}</p>
                  <ul className="knowledge-focus" aria-label="Areas of focus">
                    {selected.focus.map((focus) => (
                      <li key={focus}>{focus}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="knowledge-overview-top">
                    <span>PUBLIC OVERVIEWS</span>
                    <span>00 / 10</span>
                  </div>
                  <IndexDrawing />
                  <h3>A wider view is available.</h3>
                  <p className="knowledge-summary">
                    Clear the search to explore the ten connected areas of
                    curriculum practice.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          id="international"
          className="knowledge-panel"
          role="tabpanel"
          aria-labelledby="knowledge-tab-international"
          hidden={view !== "international"}
        >
          <div className="knowledge-international-intro">
            <p className="knowledge-category">
              FRAMEWORKS / INQUIRY / COMMUNICATION
            </p>
            <h3>{internationalPractice.title}</h3>
            <p>{internationalPractice.introduction}</p>
          </div>
          <div className="knowledge-international-areas">
            {internationalPractice.areas.map((area, index) => (
              <article key={area.title}>
                <span className="knowledge-area-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <h4>{area.title}</h4>
                <p>{area.summary}</p>
              </article>
            ))}
          </div>
          <div className="knowledge-international-skills">
            <p>RELATED PRACTICE</p>
            <ul>
              {internationalPractice.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="knowledge-boundary">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M6 9V6a4 4 0 0 1 8 0v3M4.5 9h11v8h-11V9Z"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <circle cx="10" cy="13" r="1" fill="currentColor" />
          </svg>
          <span>
            Public summaries of my contribution. Original lesson plans and
            institutional documents remain confidential.
          </span>
        </p>
      </div>
    </section>
  );
}
