import "./portfolio.css";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import BrandMark from "./BrandMark";
import PortfolioSearch from "./PortfolioSearch";
import ThresholdArt from "./ThresholdArt";
import WorkGallery from "./WorkGallery";
import KnowledgeIndex from "./KnowledgeIndex";
import { AIPractice, Background, Contact } from "./PortfolioSections";
import { caseStudies } from "./case-studies";
import { buildConversationBrief } from "./practice-model";
const AncientGame = lazy(() => import("./AncientGame"));

class GameBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="game-loading" role="alert">
          <p>The game room could not load.</p>
          <button
            type="button"
            className="atelier-button"
            onClick={() => location.reload()}
          >
            Reload the portfolio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Arrow({ diagonal = false, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
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
const fields = [
  {
    id: "learning",
    number: "01",
    label: "Learning",
    note: "Ideas that become shared capability.",
    lens: "learning",
    caseId: "media-shala",
  },
  {
    id: "communication",
    number: "02",
    label: "Communication",
    note: "Meaning that survives the handoff.",
    lens: "communication",
    caseId: "kedman-global",
  },
  {
    id: "ai",
    number: "03",
    label: "AI integration",
    note: "New tools. Clear human direction.",
    lens: "adoption",
    caseId: "ai-literacy",
  },
];
function useMotion() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem("vt-motion") !== "off";
    } catch {
      return true;
    }
  });
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    const visibility = () => setVisible(!document.hidden);
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  function toggle() {
    setEnabled((previous) => {
      const next = !previous;
      try {
        localStorage.setItem("vt-motion", next ? "on" : "off");
      } catch {
        /* Optional preference. */
      }
      return next;
    });
  }
  return { enabled, reduced, allowed: enabled && !reduced && visible, toggle };
}
export default function Portfolio() {
  const motion = useMotion();
  const [focus, setFocus] = useState("ai");
  const [selectedCase, setSelectedCase] = useState("ai-literacy");
  const [request, setRequest] = useState(null);
  const sequence = useRef(0);
  const [visited, setVisited] = useState([]);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("home");
  const [gameOpen, setGameOpen] = useState(false);
  const [gameMounted, setGameMounted] = useState(false);
  const gameDialog = useRef(null);
  const [gameSeen, setGameSeen] = useState(false);
  const [gameVersion, setGameVersion] = useState(0);
  const [intent, setIntent] = useState("leadership");
  const [challenge, setChallenge] = useState("");
  const [copied, setCopied] = useState("");
  const copyTimer = useRef(null);
  const progress = useRef(null);
  const currentField = fields.find((field) => field.id === focus);
  const explored = visited
    .map((id) => caseStudies.find((item) => item.id === id))
    .filter(Boolean);
  const brief = buildConversationBrief({
    lensId: currentField.lens,
    intent,
    challenge,
    demoSeen: gameSeen,
    caseTitles: explored.map((item) => item.shortTitle),
  });
  useEffect(() => {
    document.title = "Vinayak Thanish — Build what carries forward.";
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((section) => observer.observe(section));
    let frame;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - innerHeight;
        if (progress.current)
          progress.current.style.transform = `scaleX(${distance > 0 ? scrollY / distance : 0})`;
      });
    }
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (!menu) return;
    function escape(event) {
      if (event.key === "Escape") {
        setMenu(false);
        document.querySelector(".atelier-menu")?.focus();
      }
    }
    addEventListener("keydown", escape);
    return () => removeEventListener("keydown", escape);
  }, [menu]);
  useEffect(() => {
    if (!gameOpen) return;
    setGameMounted(true);
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    gameDialog.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      gameDialog.current?.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected && !document.querySelector("dialog[open]"))
        previous.focus({ preventScroll: true });
    };
  }, [gameOpen]);
  useEffect(() => {
    function route() {
      const hash = location.hash;
      if (["#curriculum", "#international"].includes(hash)) {
        dispatchEvent(
          new CustomEvent("portfolio:knowledge", {
            detail: { view: hash.slice(1) },
          }),
        );
        requestAnimationFrame(() =>
          document
            .getElementById("library")
            ?.scrollIntoView({ behavior: "instant" }),
        );
      }
      if (["#decision-studio", "#connection-game"].includes(hash))
        setGameOpen(true);
      if (hash === "#design-notes") {
        const disclosure = document.querySelector(".atelier-references");
        if (disclosure) disclosure.open = true;
        requestAnimationFrame(() =>
          document
            .getElementById("design-notes")
            ?.scrollIntoView({ behavior: "instant" }),
        );
      }
      if (["#about", "#experience"].includes(hash))
        requestAnimationFrame(() =>
          document
            .getElementById("background")
            ?.scrollIntoView({ behavior: "instant" }),
        );
    }
    route();
    addEventListener("hashchange", route);
    return () => removeEventListener("hashchange", route);
  }, []);
  function goTo(id) {
    setMenu(false);
    const target = document.getElementById(id);
    if (!target) return;
    history.replaceState(null, "", `#${id}`);
    requestAnimationFrame(() => {
      const heading = target.querySelector("h2,h3") || target;
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: motion.allowed ? "smooth" : "instant",
        block: "start",
      });
    });
  }
  function chooseField(id) {
    const field = fields.find((item) => item.id === id);
    if (field) {
      setFocus(id);
      setSelectedCase(field.caseId);
    }
  }
  function remember(id) {
    setVisited((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    );
  }
  function closeGame() {
    gameDialog.current?.close();
    setGameOpen(false);
  }
  function openCase(id) {
    setSelectedCase(id);
    remember(id);
    const open = () => {
      goTo("work");
      setRequest({ id, serial: ++sequence.current });
    };
    if (gameOpen) {
      closeGame();
      requestAnimationFrame(open);
    } else open();
  }
  function navigatePublic(id, options) {
    if (["curriculum", "international"].includes(id)) {
      dispatchEvent(
        new CustomEvent("portfolio:knowledge", {
          detail: { view: id, query: options?.query },
        }),
      );
      goTo("library");
      history.replaceState(null, "", `#${id}`);
      return;
    }
    if (id === "decision-studio") {
      setGameOpen(true);
      return;
    }
    if (id === "design-notes") {
      const disclosure = document.querySelector(".atelier-references");
      if (disclosure) disclosure.open = true;
    }
    goTo(id);
  }
  async function copy(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied("Select the email address, or open your email app.");
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(""), 4000);
  }
  function reset() {
    setVisited([]);
    setGameSeen(false);
    setChallenge("");
    setIntent("leadership");
    setGameVersion((value) => value + 1);
    chooseField("ai");
  }
  return (
    <div
      className="portfolio atelier-site"
      data-motion={motion.allowed ? "on" : "off"}
    >
      <div ref={progress} className="atelier-progress" aria-hidden="true" />
      <a className="atelier-skip" href="#main">
        Skip to content
      </a>
      <header className="atelier-header">
        <div className="container atelier-header-inner">
          <a
            className="atelier-brand"
            href="#home"
            aria-label="Vinayak Thanish, home"
          >
            <BrandMark />
            <span>
              Vinayak Thanish<small>THE CONNECTED PRACTICE</small>
            </span>
          </a>
          <nav
            className={
              menu ? "atelier-navigation is-open" : "atelier-navigation"
            }
            id="atelier-navigation"
            aria-label="Main navigation"
          >
            {[
              ["work", "Selected work"],
              ["practice", "The practice"],
              ["background", "Background"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                onClick={() => setMenu(false)}
              >
                {label}
              </a>
            ))}
            <a
              className="atelier-nav-contact"
              href="#contact"
              onClick={() => setMenu(false)}
            >
              Let’s talk <Arrow diagonal />
            </a>
          </nav>
          <div className="atelier-header-tools">
            <PortfolioSearch
              onOpenCase={openCase}
              onNavigate={navigatePublic}
              onChooseLens={(id) => {
                chooseField(id === "adoption" ? "ai" : id);
                goTo("home");
              }}
            />
            <button
              type="button"
              className="atelier-menu"
              aria-expanded={menu}
              aria-controls="atelier-navigation"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              onClick={() => setMenu(!menu)}
            >
              {menu ? "Close" : "Menu"}
              <span aria-hidden="true">{menu ? "−" : "+"}</span>
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <section
          id="home"
          className="atelier-hero"
          aria-labelledby="atelier-title"
        >
          <div className="container">
            <div className="atelier-folio">
              <span>INDEPENDENT THINKING. CONNECTED WORK.</span>
              <span>DELHI NCR / INDIA & INTERNATIONAL</span>
            </div>
            <div className="atelier-hero-grid">
              <div className="atelier-hero-copy">
                <p className="atelier-kicker">
                  AI INTEGRATION · LEARNING · COMMUNICATION
                </p>
                <h1 id="atelier-title">
                  Build what
                  <br />
                  <em>carries forward.</em>
                </h1>
                <p className="atelier-hero-intro">
                  I’m Vinayak. I connect complex ideas with the people who bring
                  them to life.
                </p>
                <p className="atelier-hero-description">
                  AI integration, learning systems, and creative
                  communication—shaped into work people can understand, use, and
                  own.
                </p>
                <div className="atelier-hero-actions">
                  <a href="#work" className="atelier-button">
                    Explore selected work <Arrow />
                  </a>
                  <a href="#contact" className="atelier-text-link">
                    Start a conversation <Arrow diagonal />
                  </a>
                </div>
                <div className="atelier-current">
                  <span className="atelier-live-dot" />
                  <p>
                    <span>CURRENT REMIT</span>Leading AI integration within the
                    Manav Rachna education ecosystem.
                  </p>
                </div>
              </div>
              <div className="atelier-hero-art">
                <ThresholdArt focus={focus} motion={motion.allowed} />
              </div>
            </div>
            <div
              className="atelier-fields"
              role="group"
              aria-label="Explore a field of practice"
            >
              {fields.map((field) => (
                <button
                  type="button"
                  key={field.id}
                  aria-pressed={focus === field.id}
                  onClick={() => chooseField(field.id)}
                >
                  <span>{field.number}</span>
                  <span>
                    <strong>{field.label}</strong>
                    <small>{field.note}</small>
                  </span>
                  <Arrow diagonal />
                </button>
              ))}
            </div>
            <div className="atelier-proof">
              <div>
                <strong>7 schools</strong>
                <span>Future Skills & Sustainability curriculum</span>
              </div>
              <div>
                <strong>India & Germany</strong>
                <span>Education, academic operations & partnerships</span>
              </div>
              <a href="#background">
                The experience behind the practice <Arrow />
              </a>
            </div>
          </div>
        </section>
        <WorkGallery
          selectedId={selectedCase}
          request={request}
          onSelect={setSelectedCase}
          onVisited={remember}
          onDiscuss={(item) => {
            remember(item.id);
            goTo("contact");
          }}
        />
        <AIPractice />
        <KnowledgeIndex />
        <section
          id="play"
          className="atelier-play"
          aria-labelledby="play-title"
        >
          <div className="container atelier-play-inner">
            <div className="atelier-play-drawing" aria-hidden="true">
              <svg viewBox="0 0 360 260" fill="none">
                <path
                  d="M15 15h330v230H15zM32 32h296v196H32z"
                  stroke="currentColor"
                  strokeOpacity=".25"
                />
                {Array.from({ length: 20 }, (_, i) => (
                  <g
                    key={i}
                    transform={`translate(${64 + (i % 5) * 47} ${48 + Math.floor(i / 5) * 43})`}
                  >
                    <rect
                      width="40"
                      height="36"
                      stroke="currentColor"
                      strokeOpacity=".35"
                    />
                    {[0, 7, 12, 19].includes(i) && (
                      <path
                        d="m20 5 4 9 10 4-10 4-4 9-4-9-10-4 10-4 4-9Z"
                        stroke="currentColor"
                        strokeWidth=".8"
                      />
                    )}
                  </g>
                ))}
                <circle cx="84" cy="108" r="9" fill="currentColor" />
                <circle
                  cx="226"
                  cy="151"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </div>
            <div>
              <p className="eyebrow">THE ATELIER / AN ANCIENT STRATEGY GAME</p>
              <h2 id="play-title">
                A little chance.
                <br />
                <em>A considered move.</em>
              </h2>
              <p>
                A modern interpretation of the Royal Game of Ur. Cast four
                stones, race your pieces, protect a rosette, and outthink the
                Archivist.
              </p>
              <button
                type="button"
                className="atelier-button"
                onClick={() => setGameOpen(true)}
              >
                Enter the game room <Arrow />
              </button>
              <span className="atelier-play-note">
                A quick three-piece match, or the full seven-piece race.
              </span>
            </div>
          </div>
        </section>
        <Background />
        <Contact
          intent={intent}
          setIntent={setIntent}
          challenge={challenge}
          setChallenge={setChallenge}
          brief={brief}
          explored={explored}
          focus={currentField.label}
          gameSeen={gameSeen}
          copied={copied}
          copy={copy}
          onReset={reset}
        />
      </main>
      <footer className="atelier-footer">
        <div className="container">
          <a href="#home">
            <BrandMark />
            <span>
              Vinayak Thanish<small>THE WORK IS CONNECTED.</small>
            </span>
          </a>
          <p>© {new Date().getFullYear()} / Delhi NCR, India</p>
          <div>
            <button
              type="button"
              onClick={motion.toggle}
              aria-pressed={motion.enabled && !motion.reduced}
              disabled={motion.reduced}
              aria-label={
                motion.reduced
                  ? "Motion reduced by your system preference"
                  : `Motion ${motion.enabled ? "on" : "off"}`
              }
            >
              {motion.reduced
                ? "Motion reduced"
                : `Motion ${motion.enabled ? "on" : "off"}`}
            </button>
            <a href="#home" aria-label="Back to top">
              <Arrow />
            </a>
          </div>
        </div>
      </footer>
      <dialog
        ref={gameDialog}
        className="game-dialog"
        aria-labelledby="game-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          closeGame();
        }}
        onClick={(event) => {
          if (event.currentTarget === event.target) closeGame();
        }}
      >
        <div className="game-dialog-header">
          <div>
            <span>THE ATELIER / CHANCE & JUDGEMENT</span>
            <h2 id="game-dialog-title">The game room.</h2>
          </div>
          <button
            type="button"
            aria-label="Close game room"
            onClick={closeGame}
          >
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        <GameBoundary>
          <Suspense
            fallback={
              <p className="game-loading" role="status">
                Opening the game room…
              </p>
            }
          >
            {gameMounted && (
              <AncientGame
                key={gameVersion}
                active={gameOpen}
                motion={motion.allowed}
                onExplore={() => setGameSeen(true)}
              />
            )}
          </Suspense>
        </GameBoundary>
      </dialog>
    </div>
  );
}
