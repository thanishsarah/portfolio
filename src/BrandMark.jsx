import React from 'react';

/**
 * The VT Pathway mark: an open V shares its rising arm with the T's canopy.
 * A detached seed completes the T, leaving room for the next connection.
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
      <path
        d="M10 15H19L32 49L45 15H54L36.4 63H27.6L10 15Z"
        fill="currentColor"
      />
      <path d="M45 15H71V23H61V49H53V23H44L45 15Z" fill="currentColor" />
      <circle className="brand-seed" cx="57" cy="61" r="4.5" fill="currentColor" />
    </svg>
  );
}
