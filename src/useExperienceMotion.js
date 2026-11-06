import { useEffect, useRef } from "react";

/** Progressive motion: elements remain visible if animation APIs are unavailable. */
export default function useExperienceMotion(root, enabled) {
  const seen = useRef(new WeakSet());
  useEffect(() => {
    const surface = root.current;
    if (
      !surface ||
      !enabled ||
      !Element.prototype.animate ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const animations = new Map();
    const targets = surface.querySelectorAll(
      ".atelier-hero-intro,.atelier-hero-description,.atelier-hero-actions,.atelier-current,.wg-section-heading,.wg-panel,.atelier-section-heading,.adoption-workspace,.atelier-principles>div,.knowledge-heading,.knowledge-tabs,.knowledge-index-layout,.atelier-play-inner>div,.atelier-career-item,.atelier-education,.atelier-contact-top>div",
    );
    function cancel(element) {
      animations.get(element)?.cancel();
      animations.delete(element);
    }
    function arrive(element, index) {
      if (seen.current.has(element)) return;
      seen.current.add(element);
      if (element.contains(document.activeElement)) return;
      const animation = element.animate(
        [
          { opacity: 0.2, translate: "0 12px" },
          { opacity: 1, translate: "0 0" },
        ],
        {
          duration: 580,
          delay: (index % 3) * 55,
          easing: "cubic-bezier(.2,.7,.2,1)",
          fill: "backwards",
        },
      );
      animations.set(element, animation);
      animation.finished.then(
        () => animations.delete(element),
        () => {},
      );
    }
    const indices = new Map(
      [...targets].map((target, index) => [target, index]),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          arrive(entry.target, indices.get(entry.target));
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
    );
    for (const target of targets) observer.observe(target);
    function focus(event) {
      for (const element of animations.keys()) {
        if (element.contains(event.target)) cancel(element);
      }
    }
    function revealDestination() {
      const id = location.hash.slice(1);
      const destination = document.getElementById(id);
      if (!destination) return;
      for (const target of targets) {
        if (destination.contains(target) || target.contains(destination)) {
          seen.current.add(target);
          cancel(target);
        }
      }
    }
    let frame = null;
    let pending = null;
    const highlighted = new Set();
    function pointer(event) {
      if (
        event.pointerType !== "mouse" ||
        !matchMedia("(pointer: fine)").matches
      )
        return;
      const control = event.target.closest(
        ".atelier-button,.atelier-fields>button,.wg-panel,.adoption-tabs>button,.knowledge-topic-list>button",
      );
      if (!control || !surface.contains(control)) return;
      pending = { control, x: event.clientX, y: event.clientY };
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        if (!pending?.control.isConnected) return;
        const { control, x, y } = pending;
        const box = control.getBoundingClientRect();
        control.style.setProperty("--touch-x", `${x - box.left}px`);
        control.style.setProperty("--touch-y", `${y - box.top}px`);
        highlighted.add(control);
      });
    }
    surface.addEventListener("focusin", focus);
    surface.addEventListener("pointermove", pointer, { passive: true });
    addEventListener("hashchange", revealDestination);
    revealDestination();
    return () => {
      observer.disconnect();
      for (const animation of animations.values()) animation.cancel();
      if (frame !== null) cancelAnimationFrame(frame);
      for (const element of highlighted) {
        element.style.removeProperty("--touch-x");
        element.style.removeProperty("--touch-y");
      }
      surface.removeEventListener("focusin", focus);
      surface.removeEventListener("pointermove", pointer);
      removeEventListener("hashchange", revealDestination);
    };
  }, [root, enabled]);
}
