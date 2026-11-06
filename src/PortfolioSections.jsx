import React, { useState } from "react";
import BrandMark from "./BrandMark";
import ArchitectureNotes from "./ArchitectureNotes";
import { aiPractice } from "./ai-practice";
import { profile, experience, education } from "./content";

function Arrow({ diagonal = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AIPractice() {
  const [stream, setStream] = useState("content");
  const current = aiPractice.workstreams.find((item) => item.id === stream);
  function keys(event, index) {
    if (
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 3
          : (index + (event.key === "ArrowRight" ? 1 : 3)) % 4;
    setStream(aiPractice.workstreams[next].id);
    document
      .getElementById(`stream-tab-${aiPractice.workstreams[next].id}`)
      ?.focus();
  }
  return (
    <section
      id="practice"
      className="atelier-practice"
      aria-labelledby="practice-title"
    >
      <div className="container">
        <div className="atelier-section-heading">
          <div>
            <p className="eyebrow">02 / THE PRACTICE</p>
            <h2 id="practice-title">
              Tools change.
              <br />
              <em>Judgement matters.</em>
            </h2>
          </div>
          <p>
            Useful integration starts with a human question. What should become
            easier, clearer, or possible—and who is responsible for the result?
          </p>
        </div>
        <div id="ai-integration" className="adoption-workspace">
          <div className="adoption-context">
            <p className="micro-label">
              CURRENT AI INTEGRATION REMIT / ONGOING
            </p>
            <p className="adoption-lead">
              From individual tools
              <br />
              to a shared way of working.
            </p>
            <p>{aiPractice.intro}</p>
            <div className="adoption-contexts">
              {aiPractice.context.map((item) =>
                item.url ? (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.name}
                    <Arrow diagonal />
                  </a>
                ) : (
                  <span key={item.name}>{item.name}</span>
                ),
              )}
            </div>
          </div>
          <div className="adoption-streams">
            <div
              className="adoption-tabs"
              role="tablist"
              aria-label="AI integration workstreams"
            >
              {aiPractice.workstreams.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  id={`stream-tab-${item.id}`}
                  role="tab"
                  aria-selected={stream === item.id}
                  aria-controls="adoption-panel"
                  tabIndex={stream === item.id ? 0 : -1}
                  onKeyDown={(event) => keys(event, index)}
                  onClick={() => setStream(item.id)}
                >
                  <span>0{index + 1}</span>
                  {item.title}
                </button>
              ))}
            </div>
            <div
              id="adoption-panel"
              className="adoption-panel"
              role="tabpanel"
              aria-labelledby={`stream-tab-${stream}`}
              tabIndex={0}
            >
              <div className="adoption-panel-symbol" aria-hidden="true">
                <svg viewBox="0 0 180 120" fill="none">
                  <path
                    d="M10 60H55l35-35 35 35h45M55 60l35 35 35-35M90 8v104M43 13h94v94H43z"
                    stroke="currentColor"
                    strokeWidth=".7"
                  />
                  <circle cx="90" cy="60" r="19" stroke="currentColor" />
                  <circle cx="90" cy="60" r="3" fill="currentColor" />
                </svg>
                <span>HUMAN DIRECTION / SHARED CAPABILITY</span>
              </div>
              <h3>{current.title}</h3>
              <p>{current.summary}</p>
              <ul>
                {current.focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="adoption-review">
                <span>THE HUMAN DECISION</span>
                <p>{current.review}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="atelier-principles">
          {[
            [
              "01",
              "Purpose before tools.",
              "Begin with the people and the work that needs to improve.",
            ],
            [
              "02",
              "Knowledge that transfers.",
              "Make the approach clear enough for another person to use.",
            ],
            [
              "03",
              "Responsibility stays human.",
              "Keep context, judgement, and the final decision with people.",
            ],
          ].map(([number, title, text]) => (
            <div key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Background() {
  return (
    <section
      id="background"
      className="atelier-background"
      aria-labelledby="background-title"
    >
      <div className="container">
        <div className="atelier-section-heading">
          <div>
            <p className="eyebrow">04 / THE PERSON BEHIND THE PRACTICE</p>
            <h2 id="background-title">
              A systems mind.
              <br />
              <em>A filmmaker’s eye.</em>
            </h2>
          </div>
          <div>
            <p>
              Computer applications taught me to see structure. Filmmaking
              taught me to see perspective. Education brings both into a
              relationship with people.
            </p>
            <p>
              That combination shapes how I lead, teach, communicate, and build
              practical AI capability.
            </p>
          </div>
        </div>
        <div className="atelier-career">
          <div className="atelier-career-aside">
            <BrandMark />
            <p>VINAYAK THANISH</p>
            <span>DELHI NCR, INDIA</span>
            <a href="#contact">
              Start a conversation <Arrow diagonal />
            </a>
          </div>
          <div className="atelier-career-list">
            {experience.map((item, index) => (
              <details
                key={item.organization}
                open={index === 0}
                className="atelier-career-item"
              >
                <summary>
                  <span className="atelier-career-period">{item.period}</span>
                  <span>
                    <strong>{item.organization}</strong>
                    <span>{item.role}</span>
                  </span>
                  <span aria-hidden="true">+</span>
                </summary>
                <div>
                  <p>{item.description}</p>
                  {item.remit && <p>{item.remit}</p>}
                  {item.highlights && (
                    <ul>
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
        <div className="atelier-education">
          <p className="micro-label">EDUCATION / TWO WAYS OF SEEING</p>
          {education.map((item) => (
            <div key={item.institution}>
              <span>{item.period}</span>
              <h3>{item.qualification}</h3>
              <p>{item.institution}</p>
            </div>
          ))}
        </div>
        <details className="atelier-references">
          <summary>
            <span>
              <small>BEHIND THE FORM</small>Architecture, perspective, and
              enduring ideas.
            </span>
            <span aria-hidden="true">+</span>
          </summary>
          <ArchitectureNotes />
        </details>
      </div>
    </section>
  );
}

export function Contact({
  intent,
  setIntent,
  challenge,
  setChallenge,
  brief,
  explored,
  focus,
  gameSeen,
  copied,
  copy,
  onReset,
}) {
  const emailHref = `mailto:${profile.email}?subject=${encodeURIComponent(intent === "leadership" ? "Leadership conversation — Vinayak Thanish" : "Focused advisory conversation — Vinayak Thanish")}&body=${encodeURIComponent(brief)}`;
  return (
    <section
      id="contact"
      className="atelier-contact"
      aria-labelledby="contact-title"
    >
      <div className="container">
        <div className="atelier-contact-top">
          <div>
            <p className="eyebrow">05 / THE NEXT CONNECTION</p>
            <h2 id="contact-title">
              Let’s build
              <br />
              <em>what comes next.</em>
            </h2>
          </div>
          <div className="atelier-contact-intro">
            <p>
              For senior leadership opportunities
              <br />
              and focused advisory work.
            </p>
            <span>INDIA & INTERNATIONAL</span>
            <a href={`mailto:${profile.email}`}>
              {profile.email}
              <Arrow diagonal />
            </a>
          </div>
        </div>
        <div className="atelier-contact-actions">
          <div
            className="atelier-intents"
            role="group"
            aria-label="Conversation type"
          >
            {[
              ["leadership", "Leadership opportunity"],
              ["advisory", "Focused advisory work"],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                aria-pressed={intent === id}
                onClick={() => setIntent(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <a className="atelier-button" href={emailHref}>
            {intent === "leadership"
              ? "Discuss a leadership opportunity"
              : "Explore focused advisory work"}
            <Arrow diagonal />
          </a>
          <button
            type="button"
            className="atelier-copy-email"
            onClick={() => copy(profile.email, "Email address copied")}
          >
            Copy email address
          </button>
        </div>
        <details className="atelier-brief">
          <summary>
            <span>Want to bring some context?</span>
            <span>
              Shape a conversation brief <span aria-hidden="true">+</span>
            </span>
          </summary>
          <div className="atelier-brief-grid">
            <div>
              <label htmlFor="conversation-challenge">
                What are you trying to make possible?
              </label>
              <textarea
                id="conversation-challenge"
                rows={4}
                value={challenge}
                maxLength={1200}
                onChange={(event) => setChallenge(event.target.value)}
                placeholder="The people, process, or learning challenge you have in mind…"
              />
              <p>
                Your draft stays in this page until you choose to copy it or
                open your email app.
              </p>
              <div className="atelier-explored">
                <span className="micro-label">YOUR EXPLORATION</span>
                <p>
                  {focus}
                  {explored.length
                    ? ` · ${explored.map((item) => item.shortTitle).join(" · ")}`
                    : ""}
                  {gameSeen ? " · Ancient strategy game" : ""}
                </p>
                <button type="button" onClick={onReset}>
                  Reset this exploration
                </button>
              </div>
            </div>
            <div className="atelier-brief-paper">
              <span className="micro-label">YOUR CONVERSATION BRIEF</span>
              <pre>{brief}</pre>
              <button
                type="button"
                onClick={() => copy(brief, "Conversation brief copied")}
              >
                Copy the brief <Arrow />
              </button>
            </div>
          </div>
        </details>
        <p className="atelier-copy-status" role="status" aria-live="polite">
          {copied}
        </p>
      </div>
    </section>
  );
}
