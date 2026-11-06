import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createSignalGeometry } from './signal-geometry';
import './signal-sculpture.css';

export default function SignalSculpture({ lensId = 'adoption', motion = true }) {
  const geometry = useMemo(() => createSignalGeometry(lensId), [lensId]);
  const figure = useRef(null);
  const surface = useRef(null);
  const visible = useRef(false);
  const [reduced, setReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const gradientId = useId().replaceAll(':', '');

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { visible.current = entries.some(entry => entry.isIntersecting); });
    if (figure.current) observer.observe(figure.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if ((!motion || reduced) && surface.current) surface.current.style.transform = 'none';
  }, [motion, reduced]);

  function orient(event) {
    if (!motion || reduced || !visible.current || event.pointerType !== 'mouse' || !matchMedia('(pointer: fine)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
    surface.current.style.transform = `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
  }
  function settle() { if (surface.current) surface.current.style.transform = 'none'; }

  return <figure className="signal-sculpture" ref={figure} data-lens={lensId} data-motion={motion && !reduced ? 'on' : 'off'} onPointerMove={orient} onPointerLeave={settle}>
    <div className="signal-surface" ref={surface} aria-hidden="true">
      <svg viewBox="0 0 520 500" fill="none" focusable="false" aria-hidden="true">
        <defs>
          <radialGradient id={`${gradientId}-glow`}><stop stopColor="#d1ae6f" stopOpacity=".16" /><stop offset="1" stopColor="#18231f" stopOpacity="0" /></radialGradient>
          <radialGradient id={`${gradientId}-shadow`}><stop stopColor="#020b06" stopOpacity=".7" /><stop offset="1" stopColor="#020b06" stopOpacity="0" /></radialGradient>
          <linearGradient id={`${gradientId}-axis`} x1="50" y1="440" x2="470" y2="440" gradientUnits="userSpaceOnUse"><stop stopColor="#c5a36d" stopOpacity="0" /><stop offset=".5" stopColor="#c5a36d" stopOpacity=".4" /><stop offset="1" stopColor="#c5a36d" stopOpacity="0" /></linearGradient>
        </defs>
        <ellipse cx="260" cy="225" rx="245" ry="205" fill={`url(#${gradientId}-glow)`} />
        <g stroke="#b6bda6" strokeWidth=".7" opacity=".19"><path d="M25 130V66h64M431 66h64v64M25 365v64h64M431 429h64v-64" /><path d="M18 248h14m456 0h14M260 45v13m0 381v13" /></g>
        <ellipse cx="260" cy="433" rx="185" ry="28" fill={`url(#${gradientId}-shadow)`} />
        <path d="M42 442h436" stroke={`url(#${gradientId}-axis)`} strokeWidth="1" />
        <g stroke="#c5a36d" strokeWidth=".5" opacity=".16"><path d="m88 435 172 34 172-34M130 427l130 26 130-26M172 419l88 17 88-17M88 435l84-16M432 435l-84-16M260 469v-50" /></g>
        <g key={lensId} className="signal-form">{geometry.surfaces.map(panel => <g key={panel.id}><path d={panel.path} fill={panel.fill} stroke={panel.fill} strokeWidth=".65" /><path d={panel.rib} stroke="#eee0be" strokeWidth=".65" strokeOpacity={panel.ribOpacity} /></g>)}
        {geometry.terminals.map((point, index) => <g key={index}><circle cx={point.x} cy={point.y} r="4" fill="#e6c790" /><circle cx={point.x} cy={point.y} r="10" stroke="#d4b581" strokeWidth=".7" strokeOpacity=".7" /></g>)}
        </g>
      </svg>
    </div>
    <figcaption className="signal-caption"><span>INTENTION</span><span className="signal-caption-rule" aria-hidden="true" /><span>SHARED CAPABILITY</span><p>A shared language. Room to grow.</p></figcaption>
  </figure>;
}
