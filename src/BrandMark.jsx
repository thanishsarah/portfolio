import React from 'react';

/**
 * The VT Continuum ligature lets the rising V share the T's cap.
 * A gold handoff joins distinct paths without closing the space between them.
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
      <path className="brand-convergence" d="M5 15H18L32 51L46 15H59L38 68H26Z" fill="currentColor" />
      <path className="brand-beam" d="M43 15H75V27H64V68H52V27H43Z" fill="currentColor" />
      <path className="brand-junction" d="M46 15H58L53.4 27H41.4Z" fill="var(--brand-accent, #c5a36d)" />
    </svg>
  );
}
