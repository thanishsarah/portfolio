import React from 'react';

/**
 * The VT Assembly mark joins a structural T with a converging V.
 * The small facet marks the handoff; the open interval keeps the two forms legible.
 */
export default function BrandMark({ className = '', ...props }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path className="brand-beam" d="M10 12H70V24H46V45H34V24H10Z" fill="currentColor" />
      <path className="brand-convergence" d="M8 32H22L40 59L58 32H72L46 70H34Z" fill="currentColor" />
      <path className="brand-junction" d="M34 45H46L40 53Z" fill="var(--brand-accent, #c5a36d)" />
    </svg>
  );
}
