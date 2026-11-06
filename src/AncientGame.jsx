import React, { useEffect, useMemo, useState } from "react";
import {
  createUrGame,
  getUrMoves,
  rollUr,
  moveUr,
  chooseUrMove,
  UR_PATHS,
  UR_ROSETTES,
} from "./ur-game";
import "./ancient-game.css";

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
function Stone({ value, index, revision, motion }) {
  return (
    <svg
      key={motion ? revision : 0}
      className={value ? "ur-stone is-lit" : "ur-stone"}
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
  const [visible, setVisible] = useState(!document.hidden);
  const moves = useMemo(() => getUrMoves(game), [game]);
  const human = game.turn === "human";
  const playable = active && visible;
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!playable || human || game.winner) return;
    const previous = game;
    const timer = setTimeout(
      () =>
        setGame((current) => {
          if (current !== previous) return current;
          if (current.phase === "roll") return rollUr(current);
          const move = chooseUrMove(current);
          return move ? moveUr(current, move.piece) : current;
        }),
      motion ? 650 : 180,
    );
    return () => clearTimeout(timer);
  }, [game, human, playable, motion]);
  function restart(pieces = game.pieces) {
    setGame(createUrGame({ pieces, seed: seed() }));
  }
  function cast() {
    if (!playable || !human || game.phase !== "roll") return;
    onExplore();
    setGame(rollUr);
  }
  function move(piece) {
    if (playable && human && game.phase === "move")
      setGame((previous) => moveUr(previous, piece));
  }
  const uniqueMoves = moves.filter(
    (item, index, array) =>
      array.findIndex((other) => other.to === item.to) === index,
  );
  const homeMove = human ? moves.find((item) => item.from === -1) : null;
  const exitMove = human ? moves.find((item) => item.exit) : null;
  const finished = (player) =>
    game.positions[player].filter((position) => position === 14).length;
  return (
    <section
      className="ur-game"
      data-phase={game.phase}
      data-turn={game.turn}
      data-winner={game.winner || ""}
      data-revision={game.revision}
      data-active={playable}
      data-motion={motion ? "on" : "off"}
      aria-labelledby="ur-title"
    >
      <div className="ur-intro">
        <div>
          <p>MESOPOTAMIA / A MODERN PLAYABLE INTERPRETATION</p>
          <h3 id="ur-title">The Royal Game of Ur.</h3>
        </div>
        <div className="ur-match-types" role="group" aria-label="Match length">
          <button
            type="button"
            aria-pressed={game.pieces === 3}
            onClick={() => restart(3)}
          >
            Quick / 3 pieces
          </button>
          <button
            type="button"
            aria-pressed={game.pieces === 7}
            onClick={() => restart(7)}
          >
            Full / 7 pieces
          </button>
        </div>
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
                      >
                        {ownPiece + 1}
                      </span>
                    )}
                    {aiPiece >= 0 && (
                      <span
                        className="ur-piece-token archivist"
                        data-piece={aiPiece}
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
                    className={`ur-square${rosette ? " is-rosette" : ""} is-legal`}
                    aria-label={`Move piece ${legal.piece + 1} to ${label}`}
                    onClick={() => move(legal.piece)}
                    disabled={!playable}
                    data-destination={humanIndex}
                  >
                    {content}
                  </button>
                ) : (
                  <div
                    key={cell}
                    className={`ur-square${rosette ? " is-rosette" : ""}`}
                    role="img"
                    aria-label={label}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
            <div className="ur-board-caption">
              <span>ROSETTES PROTECT / THE ROAD CONNECTS</span>
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
          <div className="ur-piece-wells">
            <div>
              <span>AT YOUR START</span>
              <div>
                {game.positions.human.map((position, i) =>
                  position === -1 ? (
                    <span className="ur-piece-token human" key={i}>
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
                  onClick={() => move(homeMove.piece)}
                  disabled={!playable}
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
                    <span className="ur-piece-token archivist" key={i}>
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
          <p className="ur-live-message" role="status" aria-live="polite">
            {game.message}
          </p>
          <div className="ur-casting-tray" aria-label="Last cast">
            <div className="ur-stones">
              {Array.from({ length: 4 }, (_, i) => (
                <Stone
                  key={i}
                  index={i}
                  value={game.dice[i] || 0}
                  revision={game.casts}
                  motion={motion}
                />
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
                    : `${[1, 4, 6, 4, 1][game.roll]} IN 16 CHANCE`}
              </span>
            </div>
          </div>
          {game.winner ? (
            <button
              type="button"
              className="ur-primary"
              onClick={() => restart()}
            >
              Begin another race <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="button"
              className="ur-primary"
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
              onClick={() => move(exitMove.piece)}
              disabled={!playable}
            >
              Bring piece {exitMove.piece + 1} home{" "}
              <span aria-hidden="true">→</span>
            </button>
          )}
          <div className="ur-score">
            <div>
              <strong>
                {finished("human")}
                <small>/{game.pieces}</small>
              </strong>
              <span>YOUR PIECES HOME</span>
            </div>
            <div>
              <strong>
                {finished("archivist")}
                <small>/{game.pieces}</small>
              </strong>
              <span>ARCHIVIST HOME</span>
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
              The opponent weighs progress, captures, safe rosettes, extra
              casts, and exact exits. Capture risk uses the actual four-stone
              probabilities. It sees the same board and casts by the same rules.
            </p>
            <a
              href="https://github.com/thanishsarah/portfolio/blob/main/src/ur-game.js"
              target="_blank"
              rel="noopener noreferrer"
            >
              Inspect the game logic ↗
            </a>
          </details>
          <button type="button" className="ur-reset" onClick={() => restart()}>
            Restart this match
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
