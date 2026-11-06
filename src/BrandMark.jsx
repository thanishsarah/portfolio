import React from 'react';

/**
 * VT Orbit: the initials are negative space inside a compact orbital core.
 * A diagonal trajectory and navigation star extend the mark beyond its boundary.
 */
export default function BrandMark({ className = '', ...props }) {
  return <svg viewBox="0 0 80 80" className={className} fill="none" aria-hidden="true" focusable="false" {...props}>
    <path className="brand-orbit-back" d="M8 56C1 47 21 28 43 18C58 11 70 11 73 17C77 23 68 34 58 43" stroke="var(--brand-accent, #68e8ff)" strokeWidth="2.2" strokeLinecap="round" opacity=".65" />
    <path className="brand-orbit-core" fillRule="evenodd" clipRule="evenodd" d="M40 14a26 26 0 1 1 0 52 26 26 0 0 1 0-52ZM20 27H27L32 44L38 27H45L35 54H29L20 27ZM47 27H62V33H57V54H51V33H47V27Z" fill="currentColor" />
    <path className="brand-orbit-front" d="M8 56C12 62 28 60 43 54" stroke="var(--brand-accent, #68e8ff)" strokeWidth="2.2" strokeLinecap="round" />
    <path className="brand-navigation-star" d="m69 7 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="var(--brand-accent, #68e8ff)" />
  </svg>;
}
