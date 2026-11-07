import { useLayoutEffect, useEffect, useRef } from "react";
import { createCastMotion, createPieceMotion } from "./ur-physics";

function piecesIn(root) {
  const pieces = new Map();
  root?.querySelectorAll("[data-ur-piece]").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width && rect.height) {
      pieces.set(element.dataset.urPiece, { element, rect });
    }
  });
  return pieces;
}

/** FLIP presentation only: game rules commit immediately and never await motion. */
export default function useUrMotion(rootRef, game, enabled) {
  const pending = useRef(null);
  const effects = useRef(new Set());
  const previousCasts = useRef(game.casts);

  function count() {
    if (rootRef.current) {
      rootRef.current.dataset.urAnimating = String(effects.current.size);
    }
  }

  function stop() {
    for (const effect of [...effects.current]) {
      effect.animation.cancel();
      effect.finish();
    }
    pending.current = null;
    count();
  }

  function track(animation, cleanup = () => {}) {
    let done = false;
    const effect = {
      animation,
      finish() {
        if (done) return;
        done = true;
        cleanup();
        effects.current.delete(effect);
        count();
      },
    };
    effects.current.add(effect);
    animation.onfinish = effect.finish;
    animation.oncancel = effect.finish;
    count();
  }

  function prepare() {
    stop();
    pending.current = enabled
      ? { pieces: piecesIn(rootRef.current), positions: game.positions }
      : null;
  }

  useLayoutEffect(() => {
    const root = rootRef.current;
    const before = pending.current;
    const cast = game.casts > previousCasts.current;
    previousCasts.current = game.casts;
    pending.current = null;
    if (!root || !enabled || !before) {
      if (!enabled) stop();
      return;
    }
    if (cast) {
      root.querySelectorAll("[data-ur-stone]").forEach((stone, index) => {
        if (typeof stone.animate !== "function" || index > 3) return;
        const curve = createCastMotion(index);
        track(
          stone.animate(curve.keyframes, {
            duration: curve.duration,
            easing: "linear",
            fill: "none",
          }),
        );
      });
    }
    const after = piecesIn(root);
    const moved = [];
    for (const [key, destination] of after) {
      const [owner, piece] = key.split("-");
      // A preview or message may reflow the wells. Only a rule-model move
      // should lift a token; unchanged pieces stay attached to their layout.
      if (before.positions[owner]?.[piece] === game.positions[owner]?.[piece])
        continue;
      const source = before.pieces.get(key);
      if (!source) continue;
      const dx = source.rect.left - destination.rect.left;
      const dy = source.rect.top - destination.rect.top;
      const scale = source.rect.width / destination.rect.width;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(scale - 1) < 0.02) {
        continue;
      }
      moved.push(key);
      const element = destination.element;
      if (typeof element.animate !== "function") continue;
      const ghost = element.cloneNode(true);
      ghost.removeAttribute("data-ur-piece");
      ghost.removeAttribute("data-piece");
      ghost.removeAttribute("id");
      ghost.setAttribute("aria-hidden", "true");
      ghost.classList.add("ur-moving-piece");
      Object.assign(ghost.style, {
        position: "fixed",
        left: `${destination.rect.left}px`,
        top: `${destination.rect.top}px`,
        width: `${destination.rect.width}px`,
        height: `${destination.rect.height}px`,
        maxWidth: "none",
        maxHeight: "none",
        margin: "0",
        zIndex: "70",
        transform: "none",
        transformOrigin: "0 0",
        pointerEvents: "none",
      });
      const opacity = element.style.opacity;
      element.style.opacity = "0";
      root.appendChild(ghost);
      const curve = createPieceMotion({ dx, dy, fromScale: scale });
      const animation = ghost.animate(curve.keyframes, {
        duration: curve.duration,
        easing: "linear",
        fill: "both",
      });
      track(animation, () => {
        ghost.remove();
        element.style.opacity = opacity;
      });
      const square = element.closest(".ur-square.is-rosette");
      if (square?.animate) {
        track(
          square.animate(
            [
              { boxShadow: "inset 0 0 0 2px #eadbb9, 0 0 0 #e9c77d00" },
              { boxShadow: "inset 0 0 0 2px #fff1c7, 0 0 19px #d9aa5c99" },
              { boxShadow: "inset 0 0 0 2px #eadbb9, 0 0 0 #e9c77d00" },
            ],
            { duration: 350, delay: curve.flight, easing: "ease-out" },
          ),
        );
      }
    }
    root.dataset.urLastMotion = moved.join(" ");
    root.dataset.urMotionEvent = game.events.at(-1)?.type || "none";
    if (game.winner && root.querySelector(".ur-score")?.animate) {
      track(
        root
          .querySelector(".ur-score")
          .animate(
            [
              { filter: "brightness(1)" },
              { filter: "brightness(1.22)" },
              { filter: "brightness(1)" },
            ],
            { duration: 900, easing: "ease-out" },
          ),
      );
    }
  }, [game, enabled]);

  useEffect(() => {
    const cancel = () => stop();
    window.addEventListener("resize", cancel);
    window.addEventListener("scroll", cancel, true);
    return () => {
      window.removeEventListener("resize", cancel);
      window.removeEventListener("scroll", cancel, true);
      stop();
    };
  }, []);

  return { prepare, stop };
}
