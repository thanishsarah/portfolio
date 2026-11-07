import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createUrGame,
  getUrMoves,
  rollUr,
  moveUr,
  chooseUrMove,
  analyseUrMoves,
  UR_ROLL_PROBABILITIES,
  UR_PATHS,
  UR_ROSETTES,
} from "./ur-game";
import "./ancient-game.css";
import useUrMotion from "./use-ur-motion";

function seed() {
  return crypto.getRandomValues(new Uint32Array(1))[0] || 1;
}
function Rosette() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth=".8" />
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d="M50 48c-15-14-8-25 0-31 8 6 15 17 0 31Z"
          transform={`rotate(${i * 45} 50 50)`}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
      <circle cx="50" cy="50" r="5" fill="currentColor" />
    </svg>
  );
}
function Stone({ value, index }) {
  return (
    <svg
      className={value ? "ur-stone is-lit" : "ur-stone"}
      data-ur-stone={index}
      viewBox="0 0 80 80"
      aria-label={`Stone ${index + 1}: ${value ? "marked" : "unmarked"}`}
      role="img"
    >
      <path
        d="M40 8 72 64 12 64 40 8Z"
        fill="#3c4135"
        stroke="#ba9a68"
        strokeWidth="1.3"
      />
      <path
        d="m40 8 7 39 25 17M47 47 12 64"
        fill="none"
        stroke="#ba9a68"
        strokeOpacity=".4"
      />
      <path d="m40 8-4 15h12L40 8Z" fill={value ? "#f2e6c7" : "#59604a"} />
      <path d="m12 64 13-7-2 7H12Z" fill="#181f19" />
      <path d="m72 64-12-6 2 6h10Z" fill="#b89661" fillOpacity=".3" />
    </svg>
  );
}

export default function AncientGame({
  active = true,
  motion = true,
  onExplore = () => {},
}) {
  const [game, setGame] = useState(() => createUrGame({ seed: seed() }));
  const [difficulty, setDifficulty] = useState("strategist");
  const [pendingDifficulty, setPendingDifficulty] = useState("strategist");
  const [pendingPieces, setPendingPieces] = useState(3);
  const [previewPiece, setPreviewPiece] = useState(null);
  const [lastDecision, setLastDecision] = useState(null);
  const [visible, setVisible] = useState(!document.hidden);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [compact, setCompact] = useState(
    () =>
      matchMedia(
        "(max-width: 760px), (max-width: 1024px) and (max-height: 520px)",
      ).matches,
  );
  const root = useRef(null);
  const currentGame = useRef(game);
  currentGame.current = game;
  const keyboard = useRef({ active: false, anchor: null, internal: false });
  const moves = useMemo(() => getUrMoves(game), [game]);
  const human = game.turn === "human";
  const analyses = useMemo(
    () =>
      human && game.phase === "move"
        ? analyseUrMoves(game, { difficulty })
        : [],
    [game, human, difficulty],
  );
  const preview = analyses.find((item) => item.piece === previewPiece) || null;
  const settingsPending =
    pendingPieces !== game.pieces || pendingDifficulty !== difficulty;
  const modeName = (value) => (value === "guide" ? "Guide" : "Strategist");
  const playable = active && visible;
  const moving = playable && motion && !reduced;
  const pieceMotion = useUrMotion(root, game, moving);
  function commit(next, animate = true) {
    if (next === currentGame.current) return;
    setPreviewPiece(null);
    if (animate) pieceMotion.prepare();
    else pieceMotion.stop();
    currentGame.current = next;
    setGame(next);
  }
  function inputIntent(event) {
    keyboard.current.active = Boolean(event && event.detail === 0);
    keyboard.current.anchor = event?.currentTarget || null;
  }
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const layout = matchMedia(
      "(max-width: 760px), (max-width: 1024px) and (max-height: 520px)",
    );
    const updateMotion = () => setReduced(preference.matches);
    const updateLayout = () => setCompact(layout.matches);
    preference.addEventListener("change", updateMotion);
    layout.addEventListener("change", updateLayout);
    return () => {
      preference.removeEventListener("change", updateMotion);
      layout.removeEventListener("change", updateLayout);
    };
  }, []);
  useLayoutEffect(() => {
    const header = root.current
      ?.closest(".game-dialog")
      ?.querySelector(".game-dialog-header");
    if (!header) return;
    const measure = () => {
      const height = header.getBoundingClientRect().height;
      if (height > 0)
        root.current?.style.setProperty("--ur-room-header", `${height}px`);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, [active]);
  useEffect(() => {
    const cancel = () => {
      keyboard.current.active = false;
    };
    const key = (event) => {
      if (["Tab", "Escape"].includes(event.key)) cancel();
    };
    const focus = (event) => {
      const flow = keyboard.current;
      if (!flow.active || flow.internal || event.target === flow.anchor) return;
      if (
        event.target === document.body &&
        (!flow.anchor?.isConnected || flow.anchor?.disabled)
      )
        return;
      cancel();
    };
    document.addEventListener("pointerdown", cancel, true);
    document.addEventListener("keydown", key, true);
    document.addEventListener("focusin", focus, true);
    return () => {
      document.removeEventListener("pointerdown", cancel, true);
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("focusin", focus, true);
    };
  }, []);
  useLayoutEffect(() => {
    if (!playable) {
      keyboard.current.active = false;
      return;
    }
    const flow = keyboard.current;
    if (!flow.active) return;
    const selector = game.winner
      ? '[data-ur-action="replay"]'
      : !human
        ? "[data-ur-status]"
        : game.phase === "move"
          ? '[data-ur-action="move"]'
          : '[data-ur-action="cast"]';
    const candidate = [...root.current.querySelectorAll(selector)].find(
      (element) => !element.disabled && element.getClientRects().length,
    );
    if (candidate) {
      flow.internal = true;
      candidate.focus({ preventScroll: true });
      flow.anchor = candidate;
      flow.internal = false;
    }
  }, [game, playable, compact]);
  useEffect(() => {
    if (!playable || human || game.winner) return;
    const previous = game;
    const timer = setTimeout(
      () => {
        const current = currentGame.current;
        if (current !== previous) return;
        if (current.phase === "roll") commit(rollUr(current));
        else {
          const move = chooseUrMove(current, { difficulty });
          if (move) {
            setLastDecision({
              piece: move.piece,
              reason: move.reason,
              revision: current.revision,
              difficulty,
            });
            commit(moveUr(current, move.piece));
          }
        }
      },
      motion ? 650 : 180,
    );
    return () => clearTimeout(timer);
  }, [game, human, playable, motion, difficulty]);
  function restart(event) {
    inputIntent(event);
    setDifficulty(pendingDifficulty);
    setLastDecision(null);
    commit(createUrGame({ pieces: pendingPieces, seed: seed() }), false);
  }
  function changeMatch(pieces, event) {
    setPendingPieces(pieces);
    if (
      currentGame.current.casts === 0 &&
      pieces !== currentGame.current.pieces
    ) {
      inputIntent(event);
      commit(createUrGame({ pieces, seed: seed() }), false);
    }
  }
  function changeDifficulty(value) {
    setPendingDifficulty(value);
    if (currentGame.current.casts === 0) setDifficulty(value);
  }
  function inspect(piece) {
    if (playable && human && game.phase === "move") setPreviewPiece(piece);
  }
  function previewEvents(piece) {
    return {
      onFocus: () => inspect(piece),
      onPointerEnter: (event) => {
        if (event.pointerType !== "touch") inspect(piece);
      },
    };
  }
  function cast(event) {
    if (!playable || !human || game.phase !== "roll") return;
    inputIntent(event);
    onExplore();
    commit(rollUr(currentGame.current));
  }
  function move(piece, event) {
    if (playable && human && game.phase === "move") {
      inputIntent(event);
      commit(moveUr(currentGame.current, piece));
    }
  }
  const uniqueMoves = moves.filter(
    (item, index, array) =>
      array.findIndex((other) => other.to === item.to) === index,
  );
  const homeMove = human ? moves.find((item) => item.from === -1) : null;
  const exitMove = human ? moves.find((item) => item.exit) : null;
  const finished = (player) =>
    game.positions[player].filter((position) => position === 14).length;
  const primaryLabel = game.winner
    ? settingsPending
      ? "Start selected race"
      : "Begin another race"
    : !human
      ? "The Archivist is thinking…"
      : game.phase === "move"
        ? "Choose a highlighted destination"
        : "Cast the four stones";
  const moveLabel = (item) =>
    item.exit
      ? `Bring piece ${item.piece + 1} home`
      : `${item.from < 0 ? "Enter" : item.capture >= 0 ? "Capture with" : "Move"} piece ${item.piece + 1} · square ${item.to + 1}`;
  const moveEffects = (item) => {
    const effects =
      analyses.find((entry) => entry.piece === item.piece)?.effects || [];
    return effects
      .filter((effect) =>
        ["Exact exit", "Protected rosette", "Another cast", "Capture"].includes(
          effect,
        ),
      )
      .join(" · ");
  };
  const routeLabel = (item) =>
    `${item.from < 0 ? "Start" : `Square ${item.from + 1}`} → ${item.exit ? "Home" : `square ${item.to + 1}`} · ${game.roll} ${game.roll === 1 ? "step" : "steps"}`;
  const previewClass = (index) => {
    if (!preview || index < 0) return "";
    let value = "";
    if (index === preview.from) value += " is-preview-source";
    if (index > preview.from && index <= preview.to)
      value += " is-preview-route";
    if (index === preview.to) value += " is-preview-target";
    if (index === preview.to && preview.capture >= 0)
      value += " is-preview-capture";
    return value;
  };
  return (
    <section
      ref={root}
      className="ur-game"
      data-phase={game.phase}
      data-turn={game.turn}
      data-winner={game.winner || ""}
      data-revision={game.revision}
      data-active={playable}
      data-motion={moving ? "on" : "off"}
      data-ur-difficulty={difficulty}
      data-ur-preview-piece={preview?.piece ?? ""}
      aria-labelledby="ur-title"
    >
      <div className="ur-intro">
        <div>
          <p>MESOPOTAMIA / A MODERN PLAYABLE INTERPRETATION</p>
          <h3 id="ur-title">The Royal Game of Ur.</h3>
        </div>
        <div className="ur-match-selection">
          <div
            className="ur-match-types"
            role="group"
            aria-label="Selected race length"
          >
            <button
              type="button"
              aria-pressed={pendingPieces === 3}
              onClick={(event) => changeMatch(3, event)}
            >
              Quick / 3 pieces
            </button>
            <button
              type="button"
              aria-pressed={pendingPieces === 7}
              onClick={(event) => changeMatch(7, event)}
            >
              Full / 7 pieces
            </button>
          </div>
          <p className="ur-current-race">
            Playing: {game.pieces === 3 ? "Quick" : "Full"} ·{" "}
            {modeName(difficulty)}
            {settingsPending ? " / next race selected" : ""}
          </p>
        </div>
      </div>
      <div className="ur-action-dock" aria-label="Turn controls">
        <div className="ur-dock-top">
          <span>
            {game.winner
              ? "RACE COMPLETE"
              : human
                ? "YOUR TURN / IVORY"
                : "THE ARCHIVIST’S TURN"}
          </span>
          <span>
            CAST <strong>{game.roll === null ? "—" : game.roll}</strong>
          </span>
        </div>
        <p
          className="ur-dock-message"
          data-ur-status
          tabIndex={-1}
          role={compact ? "status" : undefined}
          aria-live={compact ? "polite" : undefined}
        >
          {game.message}
        </p>
        <button
          type="button"
          className="ur-primary"
          data-ur-action={game.winner ? "replay" : "cast"}
          onClick={(event) => (game.winner ? restart(event) : cast(event))}
          disabled={
            !game.winner && (!playable || !human || game.phase !== "roll")
          }
        >
          {primaryLabel}
          <span aria-hidden="true">
            {game.winner || game.phase === "move" ? "→" : "◇"}
          </span>
        </button>
        {human && game.phase === "move" && (
          <div
            className="ur-move-choices"
            role="group"
            aria-label="Choose a legal move"
          >
            {uniqueMoves.map((item) => (
              <button
                type="button"
                key={item.piece}
                data-ur-action="move"
                {...previewEvents(item.piece)}
                onClick={(event) => move(item.piece, event)}
                disabled={!playable}
              >
                <span className="ur-choice-copy">
                  {moveLabel(item)}
                  {moveEffects(item) && <small>{moveEffects(item)}</small>}
                </span>
                <span className="ur-choice-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ur-layout">
        <div className="ur-table">
          <div className="ur-player-band archivist">
            <span className="ur-piece-token archivist" />
            <span>THE ARCHIVIST</span>
            <span>
              {finished("archivist")} / {game.pieces} HOME
            </span>
          </div>
          <div className="ur-board-shell">
            <div className="ur-route-note">
              <span>PRIVATE COURTS</span>
              <span>THE SHARED ROAD</span>
            </div>
            <div
              className="ur-board"
              role="group"
              aria-label="Twenty-square Ur board"
            >
              {Array.from({ length: 24 }, (_, cell) => {
                const row = Math.floor(cell / 8),
                  col = cell % 8;
                const humanIndex = UR_PATHS.human.findIndex(
                  ([r, c]) => r === row && c === col,
                );
                const aiIndex = UR_PATHS.archivist.findIndex(
                  ([r, c]) => r === row && c === col,
                );
                if (humanIndex < 0 && aiIndex < 0)
                  return (
                    <div className="ur-board-gap" key={cell} aria-hidden="true">
                      {col === 4 ? "◈" : ""}
                    </div>
                  );
                const ownPiece =
                  humanIndex >= 0
                    ? game.positions.human.indexOf(humanIndex)
                    : -1;
                const aiPiece =
                  aiIndex >= 0 ? game.positions.archivist.indexOf(aiIndex) : -1;
                const legal = human
                  ? uniqueMoves.find((item) => item.to === humanIndex)
                  : null;
                const index = humanIndex >= 0 ? humanIndex : aiIndex;
                const rosette = UR_ROSETTES.includes(index);
                const content = (
                  <>
                    {rosette ? (
                      <Rosette />
                    ) : (
                      <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                        <path
                          d={
                            cell % 3 === 0
                              ? "M20 20h60v60H20zM32 32h36v36H32zM44 44h12v12H44z"
                              : cell % 3 === 1
                                ? "M50 15 85 50 50 85 15 50 50 15ZM50 29 71 50 50 71 29 50 50 29Z"
                                : "M20 25h60M20 50h60M20 75h60M25 20v60M50 20v60M75 20v60"
                          }
                          stroke="currentColor"
                          strokeWidth=".9"
                        />
                      </svg>
                    )}
                    <span className="ur-square-index">{index + 1}</span>
                    {ownPiece >= 0 && (
                      <span
                        className="ur-piece-token human"
                        data-piece={ownPiece}
                        data-ur-piece={`human-${ownPiece}`}
                      >
                        {ownPiece + 1}
                      </span>
                    )}
                    {aiPiece >= 0 && (
                      <span
                        className="ur-piece-token archivist"
                        data-piece={aiPiece}
                        data-ur-piece={`archivist-${aiPiece}`}
                      >
                        {aiPiece + 1}
                      </span>
                    )}
                    {legal && (
                      <span className="ur-destination-dot" aria-hidden="true" />
                    )}
                  </>
                );
                const label = `${row === 1 ? "Shared" : "Private"} square ${index + 1}${rosette ? ", rosette" : ""}${ownPiece >= 0 ? `, your piece ${ownPiece + 1}` : ""}${aiPiece >= 0 ? `, Archivist piece ${aiPiece + 1}` : ""}`;
                return legal && !game.winner ? (
                  <button
                    type="button"
                    key={cell}
                    className={`ur-square${rosette ? " is-rosette" : ""} is-legal${previewClass(humanIndex)}`}
                    aria-label={`Move piece ${legal.piece + 1} to ${label}`}
                    onClick={(event) => move(legal.piece, event)}
                    disabled={!playable}
                    data-destination={humanIndex}
                    data-ur-action="move"
                    {...previewEvents(legal.piece)}
                  >
                    {content}
                  </button>
                ) : (
                  <div
                    key={cell}
                    className={`ur-square${rosette ? " is-rosette" : ""}${previewClass(humanIndex)}`}
                    role="img"
                    aria-label={label}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
            <div className="ur-board-caption">
              <span>ROSETTES: ANOTHER CAST / CENTRE: PROTECTED</span>
              <span>20 SQUARES</span>
            </div>
          </div>
          <div className="ur-player-band human">
            <span className="ur-piece-token human" />
            <span>YOU / IVORY</span>
            <span>
              {finished("human")} / {game.pieces} HOME
            </span>
          </div>
          <p className="ur-route-legend">
            <span aria-hidden="true">↖ → ↘</span> Your route: left court →
            shared road → right court → home.
          </p>
          {human && game.phase === "move" && (
            <div className="ur-move-insight" data-ur-insight>
              <p className="ur-insight-label">
                {preview
                  ? `PIECE ${preview.piece + 1} / MOVE PREVIEW`
                  : "READ THE BOARD"}
              </p>
              {preview ? (
                <>
                  <p className="ur-insight-route">{routeLabel(preview)}</p>
                  <div className="ur-effect-list">
                    {preview.effects.map((effect) => (
                      <span key={effect}>{effect}</span>
                    ))}
                  </div>
                  <p>{preview.reason.split(" A rival's next cast")[0]}</p>
                  {preview.captureWeight > 0 && (
                    <p className="ur-capture-risk">
                      Rival’s next cast offers a legal capture on{" "}
                      {preview.captureWeight} of 16 equally likely stone
                      patterns. It may choose another move.
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Hover or focus a destination to inspect its path and effects.
                  Select a destination to move.
                </p>
              )}
              <details className="ur-inspect-moves">
                <summary>Inspect moves without playing</summary>
                <div role="group" aria-label="Inspect a legal move">
                  {analyses.map((item) => (
                    <button
                      type="button"
                      key={item.piece}
                      aria-pressed={preview?.piece === item.piece}
                      onClick={() => inspect(item.piece)}
                      {...previewEvents(item.piece)}
                    >
                      Inspect piece {item.piece + 1}
                      {item.recommended ? " · suggested" : ""}
                    </button>
                  ))}
                </div>
                <p>
                  Inspection never commits a move. The suggestion weighs the
                  visible board; future casts are unknown.
                </p>
              </details>
            </div>
          )}
          <div className="ur-piece-wells">
            <div>
              <span>AT YOUR START</span>
              <div>
                {game.positions.human.map((position, i) =>
                  position === -1 ? (
                    <span
                      className="ur-piece-token human"
                      key={i}
                      data-ur-piece={`human-${i}`}
                    >
                      {i + 1}
                    </span>
                  ) : null,
                )}
                {!game.positions.human.includes(-1) && (
                  <small>All pieces in play</small>
                )}
              </div>
              {homeMove && (
                <button
                  type="button"
                  onClick={(event) => move(homeMove.piece, event)}
                  disabled={!playable}
                  data-ur-action="move"
                  {...previewEvents(homeMove.piece)}
                >
                  Enter a piece <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
            <div>
              <span>AT THE ARCHIVIST’S START</span>
              <div>
                {game.positions.archivist.map((position, i) =>
                  position === -1 ? (
                    <span
                      className="ur-piece-token archivist"
                      key={i}
                      data-ur-piece={`archivist-${i}`}
                    >
                      {i + 1}
                    </span>
                  ) : null,
                )}
                {!game.positions.archivist.includes(-1) && (
                  <small>All pieces in play</small>
                )}
              </div>
            </div>
          </div>
          <details className="ur-rules">
            <summary>
              How the race works <span aria-hidden="true">+</span>
            </summary>
            <ol>
              <li>
                Cast four stones. Count the marked tips, from zero to four.
              </li>
              <li>
                Choose a highlighted square to enter or advance a piece. Your
                route starts at the lower-left court, follows the shared road,
                and returns through the lower-right court.
              </li>
              <li>
                Landing on a rival on the shared road sends it back to its
                start. Your own pieces cannot share a square.
              </li>
              <li>
                Land on a rosette to cast again. The central rosette also
                protects its occupant.
              </li>
              <li>
                An exact cast brings a piece home. Bring all your pieces home to
                win.
              </li>
            </ol>
            <a
              href="https://www.britishmuseum.org/collection/object/W_1928-1009-378"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the ancient board / British Museum ↗
            </a>
            <p>This is a modern interpretation of a historical race game.</p>
          </details>
        </div>
        <aside className="ur-play-desk">
          <div className="ur-turn-label">
            <span className={human ? "human" : "archivist"} />
            {game.winner
              ? "THE RACE IS COMPLETE"
              : human
                ? "YOUR TURN"
                : "THE ARCHIVIST’S TURN"}
          </div>
          <h4>
            {game.winner
              ? game.winner === "human"
                ? "A considered victory."
                : "The road turns again."
              : human
                ? game.phase === "roll"
                  ? "Chance opens a path."
                  : "Now, choose your move."
                : "An opponent with a plan."}
          </h4>
          <p
            className="ur-live-message"
            data-ur-status
            tabIndex={-1}
            role={compact ? undefined : "status"}
            aria-live={compact ? "off" : "polite"}
          >
            {game.message}
          </p>
          <div className="ur-casting-tray" aria-label="Last cast">
            <div className="ur-stones">
              {Array.from({ length: 4 }, (_, i) => (
                <Stone key={i} index={i} value={game.dice[i] || 0} />
              ))}
            </div>
            <div className="ur-cast-total">
              <span>THE CAST</span>
              <strong>{game.roll === null ? "—" : game.roll}</strong>
              <span>
                {game.roll === 2
                  ? "MOST LIKELY / 6 IN 16"
                  : game.roll === null
                    ? "FOUR STONES / FIVE OUTCOMES"
                    : `${UR_ROLL_PROBABILITIES[game.roll] * 16} IN 16 CHANCE`}
              </span>
            </div>
          </div>
          {game.winner ? (
            <button
              type="button"
              className="ur-primary"
              data-ur-action="replay"
              onClick={restart}
            >
              {primaryLabel} <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="button"
              className="ur-primary"
              data-ur-action="cast"
              onClick={cast}
              disabled={!playable || !human || game.phase !== "roll"}
            >
              {!human
                ? "The Archivist is thinking…"
                : game.phase === "move"
                  ? "Choose a highlighted destination"
                  : "Cast the four stones"}
              <span aria-hidden="true">
                {game.phase === "roll" ? "◇" : "→"}
              </span>
            </button>
          )}
          {exitMove && (
            <button
              type="button"
              className="ur-home-action"
              data-ur-action="move"
              onClick={(event) => move(exitMove.piece, event)}
              disabled={!playable}
              {...previewEvents(exitMove.piece)}
            >
              Bring piece {exitMove.piece + 1} home{" "}
              <span aria-hidden="true">→</span>
            </button>
          )}
          <details className="ur-race-settings">
            <summary>
              Race settings{settingsPending ? " · next race" : ""}
            </summary>
            <fieldset>
              <legend>The Archivist</legend>
              {["guide", "strategist"].map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="ur-difficulty"
                    value={value}
                    checked={pendingDifficulty === value}
                    onChange={() => changeDifficulty(value)}
                  />
                  <span>
                    <strong>{modeName(value)}</strong>
                    <small>
                      {value === "guide"
                        ? "Weighs the immediate move."
                        : "Also weighs likely replies."}
                    </small>
                  </span>
                </label>
              ))}
            </fieldset>
            <p>
              Both use the same fair stones: 0–4 marks have 1, 4, 6, 4, 1
              chances in 16. The animation does not determine the cast.
            </p>
            {game.casts > 0 && (
              <p>
                Selections apply to the next race. Your current race continues
                until you start again.
              </p>
            )}
          </details>
          {settingsPending && (
            <div className="ur-pending-race">
              <p>
                Next race:{" "}
                {pendingPieces === 3 ? "Quick / 3 pieces" : "Full / 7 pieces"} ·{" "}
                {modeName(pendingDifficulty)}
              </p>
              <button type="button" onClick={restart}>
                Start selected race <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
          {lastDecision && (
            <div
              className="ur-decision"
              data-ur-decision-revision={lastDecision.revision}
            >
              <p>THE ARCHIVIST’S LAST DECISION</p>
              <span>
                Piece {lastDecision.piece + 1}: {lastDecision.reason}
              </span>
            </div>
          )}
          <div className="ur-score">
            <div>
              <strong>
                {finished("human")}
                <small>/{game.pieces}</small>
              </strong>
              <span>YOUR PIECES HOME</span>
              <div
                className="ur-finished-tokens"
                aria-label="Your finished pieces"
              >
                {game.positions.human.map((position, i) =>
                  position === 14 ? (
                    <span
                      className="ur-piece-token human"
                      key={i}
                      data-ur-piece={`human-${i}`}
                    >
                      {i + 1}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
            <div>
              <strong>
                {finished("archivist")}
                <small>/{game.pieces}</small>
              </strong>
              <span>ARCHIVIST HOME</span>
              <div
                className="ur-finished-tokens"
                aria-label="Archivist finished pieces"
              >
                {game.positions.archivist.map((position, i) =>
                  position === 14 ? (
                    <span
                      className="ur-piece-token archivist"
                      key={i}
                      data-ur-piece={`archivist-${i}`}
                    >
                      {i + 1}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          </div>
          <div className="ur-journal">
            <p>THE LAST MOVES</p>
            <ol>
              {game.events
                .filter((event) => event.type !== "cast")
                .slice(-4)
                .reverse()
                .map((event) => (
                  <li key={event.id}>{event.text}</li>
                ))}
            </ol>
            {!game.events.length && (
              <span>The board is waiting for its first move.</span>
            )}
          </div>
          <details className="ur-strategy">
            <summary>Inside the Archivist’s strategy</summary>
            <p>
              {difficulty === "strategist"
                ? "The Strategist weighs each legal move, then the best reply to each of the five possible next casts."
                : "The Guide weighs immediate progress, captures, rosettes, extra casts, and exact exits."}{" "}
              Capture exposure uses the actual four-stone probabilities. Both
              see the same board as you and cannot see future casts.
            </p>
            <a
              href="https://github.com/thanishsarah/portfolio/blob/main/src/ur-game.js"
              target="_blank"
              rel="noopener noreferrer"
            >
              Inspect the game logic ↗
            </a>
          </details>
          {game.events.length > 0 && (
            <details className="ur-race-review">
              <summary>
                Review this race · {game.events.length} recent events
              </summary>
              <ol>
                {[...game.events].reverse().map((event) => (
                  <li key={event.id}>{event.text}</li>
                ))}
              </ol>
              <p>The latest 40 events stay here while this race is open.</p>
            </details>
          )}
          <button type="button" className="ur-reset" onClick={restart}>
            {settingsPending ? "Start selected race" : "Restart this match"}
          </button>
          <p className="ur-local-note">
            The match pauses when this room closes or the page is hidden.
            Nothing is stored or sent.
          </p>
        </aside>
      </div>
    </section>
  );
}
