import React, { useEffect, useRef, useState } from "react";
import { caseStudies } from "./case-studies";
import ProjectArtwork from "./ProjectArtwork";
import "./work-gallery.css";

const displays = {
  "ai-literacy": {
    category: "AI / CURRENT REMIT",
    title: "AI, in human hands.",
    subtitle: "AI integration & team enablement",
    detail: "Content, communication, brand & business promotion.",
    wide: true,
  },
  "media-shala": {
    category: "LEARNING / CURRICULUM",
    title: "Learning that travels.",
    subtitle: "Media Shala",
    detail: "K–12 curriculum, educator development, seven schools.",
  },
  "kedman-global": {
    category: "INTERNATIONAL / FRAMEWORKS",
    title: "Across perspectives.",
    subtitle: "Kedman Global & IB-aligned communication",
    detail: "Educational frameworks, programme integration & communication.",
  },
  "paryavaran-baal-sansad": {
    category: "LEADERSHIP / DIRECTION",
    title: "Purpose, brought together.",
    subtitle: "Paryavaran Baal Sansad",
    detail: "Programme leadership and direction.",
    wide: true,
  },
};

function Arrow({ diagonal = false, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaseDialog({ item, onClose, onDiscuss, onNavigate }) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const callbacks = useRef({ onClose, onDiscuss, onNavigate });
  callbacks.current = { onClose, onDiscuss, onNavigate };

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected && !["BODY", "HTML"].includes(previous.tagName))
        previous.focus({ preventScroll: true });
    };
  }, []);

  function close() {
    callbacks.current.onClose();
  }
  function discuss() {
    close();
    callbacks.current.onDiscuss?.(item);
  }
  function visitConnection(event) {
    const target = event.currentTarget.getAttribute("href");
    const navigate = callbacks.current.onNavigate;
    if (
      typeof navigate === "function" &&
      target?.startsWith("#") &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey
    ) {
      event.preventDefault();
      close();
      requestAnimationFrame(() => navigate(target.slice(1)));
      return;
    }
    close();
  }

  return (
    <dialog
      ref={dialog}
      className="wg-dialog"
      aria-labelledby="wg-dialog-title"
      aria-describedby="wg-dialog-summary"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="wg-dialog-topline">
        <span>
          WORK ACCOUNT /{" "}
          {String(caseStudies.indexOf(item) + 1).padStart(2, "0")}
        </span>
        <span>{item.status}</span>
        <button
          ref={closeButton}
          type="button"
          onClick={close}
          aria-label="Close work account"
        >
          <span>Close</span>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="m5 5 10 10M5 15 15 5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </button>
      </div>
      <div className="wg-dialog-scroll">
        <header className="wg-dialog-heading">
          <p className="wg-label">{displays[item.id].subtitle}</p>
          <h2 id="wg-dialog-title">{item.title}</h2>
          <p id="wg-dialog-summary">{item.summary}</p>
        </header>
        <div className="wg-dialog-introduction">
          <div className="wg-dialog-art">
            <ProjectArtwork kind={item.kind} />
            <span>ORIGINAL PORTFOLIO ILLUSTRATION</span>
          </div>
          <dl className="wg-dialog-remit">
            <div>
              <dt>MY RESPONSIBILITY</dt>
              <dd>{item.role}</dd>
            </div>
            <div>
              <dt>SCOPE</dt>
              <dd>{item.scope}</dd>
            </div>
            <div>
              <dt>THE CONTEXT</dt>
              <dd>{item.context}</dd>
            </div>
          </dl>
        </div>
        <section
          className="wg-dialog-contribution"
          aria-labelledby="wg-contribution-title"
        >
          <p className="wg-label" id="wg-contribution-title">
            {item.contributionTitle}
          </p>
          <ul>
            {item.contribution.map((contribution) => (
              <li key={contribution}>{contribution}</li>
            ))}
          </ul>
        </section>
        <div className="wg-dialog-question">
          <span aria-hidden="true">01 / THE QUESTION BEHIND THE WORK</span>
          <p>{item.question}</p>
        </div>
        <div className="wg-dialog-human">
          <section>
            <h3>People & context</h3>
            <p>{item.people}</p>
          </section>
          <section>
            <h3>What needs care</h3>
            <p>{item.constraint}</p>
          </section>
        </div>
        <section
          className="wg-dialog-approach"
          aria-labelledby="wg-approach-title"
        >
          <p className="wg-label" id="wg-approach-title">
            THE APPROACH I BRING
          </p>
          <ol>
            {item.approach.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          className="wg-dialog-evidence"
          aria-labelledby="wg-evidence-title"
        >
          <div className="wg-evidence-heading">
            <span aria-hidden="true" />
            <h3 id="wg-evidence-title">{item.evidence.label}</h3>
          </div>
          <p>{item.evidence.summary}</p>
          <p className="wg-evidence-boundary">{item.evidence.boundary}</p>
          <div>
            {item.links.map((link) => (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                key={link.url}
              >
                {link.label}
                <Arrow diagonal />
              </a>
            ))}
          </div>
        </section>
        <div className="wg-dialog-connections">
          <p className="wg-label">CONTINUE THE CONNECTION</p>
          {item.connections.map((connection) => (
            <a
              key={connection.target}
              href={connection.target}
              onClick={visitConnection}
            >
              <span>
                <strong>{connection.label}</strong>
                <span>{connection.reason}</span>
              </span>
              <Arrow />
            </a>
          ))}
        </div>
        <footer className="wg-dialog-footer">
          <div>
            <p className="wg-label">A CONVERSATION TO HAVE</p>
            <p>{item.conversation}</p>
          </div>
          <button type="button" onClick={discuss}>
            Discuss this work
            <Arrow diagonal />
          </button>
        </footer>
      </div>
    </dialog>
  );
}

/** All accounts are public summaries; no source document is imported or embedded. */
export default function WorkGallery({
  selectedId = "ai-literacy",
  request = null,
  onSelect = () => {},
  onVisited = () => {},
  onDiscuss = () => {},
  onNavigate,
}) {
  const [openId, setOpenId] = useState(null);
  const callbacks = useRef({ onSelect, onVisited, onDiscuss, onNavigate });
  callbacks.current = { onSelect, onVisited, onDiscuss, onNavigate };

  function openAccount(id) {
    if (!caseStudies.some((item) => item.id === id)) return;
    setOpenId(id);
    callbacks.current.onSelect(id);
    callbacks.current.onVisited(id);
  }

  useEffect(() => {
    if (request?.id && caseStudies.some((item) => item.id === request.id)) {
      setOpenId(request.id);
      callbacks.current.onSelect(request.id);
      callbacks.current.onVisited(request.id);
    }
  }, [request?.id, request?.serial]);

  const opened = caseStudies.find((item) => item.id === openId);

  return (
    <section
      className="work-gallery"
      id="work"
      aria-labelledby="work-gallery-title"
    >
      <div className="container">
        <div className="wg-section-heading">
          <div>
            <p className="wg-label">01 / SELECTED CONTEXTS</p>
            <h2 id="work-gallery-title">
              The work,
              <br />
              <em>in context.</em>
            </h2>
          </div>
          <div>
            <p>
              Ideas meet institutions, classrooms, and people. These accounts
              make my role and contribution clear.
            </p>
            <span>FOUR CONTEXTS / ONE CONNECTED PRACTICE</span>
          </div>
        </div>
        <div className="wg-grid">
          {caseStudies.map((item, index) => {
            const display = displays[item.id];
            return (
              <article
                className={`wg-panel${display.wide ? " wg-panel-wide" : ""}${selectedId === item.id ? " is-selected" : ""}`}
                key={item.id}
                data-case-id={item.id}
              >
                <div className="wg-panel-art">
                  <ProjectArtwork kind={item.kind} />
                  <span className="wg-art-coordinate" aria-hidden="true">
                    VT / {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="wg-panel-content">
                  <div className="wg-panel-topline">
                    <span>{display.category}</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="wg-panel-status">
                    <span aria-hidden="true" />
                    {item.status}
                  </p>
                  <h3>{display.title}</h3>
                  <p className="wg-panel-subtitle">{display.subtitle}</p>
                  <p className="wg-panel-description">{display.detail}</p>
                  <button
                    className="wg-panel-open"
                    type="button"
                    onClick={() => openAccount(item.id)}
                    aria-label={`Read ${display.subtitle} work account`}
                  >
                    <span>Read the account</span>
                    <Arrow diagonal />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="wg-gallery-footnote">
          <span aria-hidden="true">∴</span>
          <p>
            Public accounts of my contribution. Original institutional materials
            remain confidential.
          </p>
          <a href="#contact">
            Start a conversation
            <Arrow diagonal />
          </a>
        </div>
      </div>
      {opened && (
        <CaseDialog
          item={opened}
          onClose={() => setOpenId(null)}
          onDiscuss={(item) => callbacks.current.onDiscuss(item)}
          onNavigate={
            typeof onNavigate === "function"
              ? (target) => callbacks.current.onNavigate?.(target)
              : undefined
          }
        />
      )}
    </section>
  );
}
