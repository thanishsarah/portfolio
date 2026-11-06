import React, { useEffect, useRef, useState } from 'react';
import './architecture-notes.css';

function StepwellStudy() {
  return <svg viewBox="0 0 360 240" fill="none" role="img" aria-label="Original study diagram of repeated stair geometry, inspired by Chand Baori">
    <path className="architecture-datum" d="M20 28H340M20 212H340M28 20V220M332 20V220M180 20V220" />
    <path className="architecture-faint" d="M44 47H316L254 184H106L44 47Z" />
    {Array.from({ length: 7 }, (_, row) => {
      const left = 48 + row * 8.5, top = 49 + row * 19, width = 264 - row * 17, count = 8 - row;
      const step = width / count;
      return <g key={row}>{Array.from({ length: count }, (_, col) => <path key={col} className="architecture-line" d={`M${left + col * step} ${top}h${step * .5}v8h${step * .5}v9`} />)}<path className="architecture-faint" d={`M${left} ${top + 17}h${width}`} /></g>;
    })}
    <path className="architecture-accent" d="M180 49v19h-16v19h16v19h-16v19h16v19h-16v19h16v19" />
    <rect x="148" y="188" width="64" height="12" className="architecture-water" />
    <path className="architecture-measure" d="M48 226H312m-264-4v8m264-8v8" />
    <text x="34" y="37">REPETITION / DESCENT</text><text x="243" y="204">STUDY 01</text>
  </svg>;
}

function StupaStudy() {
  return <svg viewBox="0 0 360 240" fill="none" role="img" aria-label="Original diagram of a circular route and gateway, inspired by Sanchi">
    <path className="architecture-datum" d="M20 28H340M20 212H340M28 20V220M332 20V220M180 20V220" />
    <circle cx="180" cy="119" r="78" className="architecture-faint" />
    <circle cx="180" cy="119" r="61" className="architecture-line" />
    <circle cx="180" cy="119" r="41" className="architecture-line" />
    <circle cx="180" cy="119" r="37" className="architecture-faint" />
    <path className="architecture-measure" d="M92 119H268M180 32V206" />
    <path className="architecture-accent" d="M230 154a61 61 0 1 0-86 14" />
    <path className="architecture-accent" d="m138 160 6 8-10 1" />
    <g className="architecture-line"><path d="M157 173v33m46-33v33M148 178h64M148 187h64M152 170h56" /><path d="M170 173v-12h20v12" /></g>
    <path className="architecture-faint" d="M154 63h52M180 60v-8m-4 4h8" />
    <circle cx="180" cy="119" r="3" className="architecture-jewel" />
    <text x="34" y="37">CIRCULATION / THRESHOLD</text><text x="243" y="204">STUDY 02</text>
  </svg>;
}

function NetStudy() {
  const nodes = Array.from({ length: 15 }, (_, index) => ({ x: 60 + index % 5 * 60, y: 61 + Math.floor(index / 5) * 59 }));
  return <svg viewBox="0 0 360 240" fill="none" role="img" aria-label="Original network study inspired by the philosophical image of Indra’s net">
    <path className="architecture-datum" d="M20 28H340M20 212H340M28 20V220M332 20V220M180 20V220" />
    <g className="architecture-faint">{nodes.map((node, index) => <React.Fragment key={index}>{index % 5 < 4 && <path d={`M${node.x} ${node.y}h60`} />}{index < 10 && <path d={`M${node.x} ${node.y}v59`} />}{index < 10 && index % 5 < 4 && <path d={`M${node.x} ${node.y}l60 59m-60 0 60-59`} />}</React.Fragment>)}</g>
    <g className="architecture-accent"><path d="M60 61 180 120 300 61M60 179 180 120 300 179M180 61v118M120 61 180 120 240 61M120 179 180 120 240 179" /></g>
    {nodes.map((node, index) => <g key={index}><path className={index === 7 ? 'architecture-accent' : 'architecture-line'} d={`m${node.x} ${node.y - 6} 6 6-6 6-6-6 6-6Z`} /><circle cx={node.x} cy={node.y} r={index === 7 ? 2.5 : 1.5} className="architecture-jewel" /></g>)}
    <circle cx="180" cy="120" r="17" className="architecture-accent" />
    <text x="34" y="37">RELATIONSHIP / REFLECTION</text><text x="243" y="204">STUDY 03</text>
  </svg>;
}

const studies = [
  { number: '01', kind: 'ARCHITECTURE / RAJASTHAN', title: 'Chand Baori', place: 'Abhaneri, India', Drawing: StepwellStudy, description: 'The stepwell at Abhaneri makes descent legible through repeating stairs. Its rhythm informs a simple design choice here: small steps, visible progress, and a clear way forward.', principle: 'Make complexity navigable.', source: 'Rajasthan Tourism', url: 'https://www.tourism.rajasthan.gov.in/abhaneri.html' },
  { number: '02', kind: 'ARCHITECTURE / MADHYA PRADESH', title: 'Sanchi', place: 'Madhya Pradesh, India', Drawing: StupaStudy, description: 'At Sanchi, gateways and circular paths shape movement around the stupa. That attention to approach and return informs a page with clear entrances, pauses, and points of orientation.', principle: 'Give movement a purpose.', source: 'UNESCO World Heritage Centre', url: 'https://whc.unesco.org/en/list/524/' },
  { number: '03', kind: 'PHILOSOPHICAL IMAGE / HUAYAN BUDDHISM', title: 'Indra’s net', place: 'An image of interdependence', Drawing: NetStudy, description: 'In Huayan Buddhist thought, the jewel-filled net expresses mutual reflection and interdependence. Here, it prompts a question for every system: how does each part affect the whole?', principle: 'See the relationships.', source: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/entries/buddhism-huayan/' },
];

export default function ArchitectureNotes() {
  const section = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { threshold: .12 }); if (section.current) observer.observe(section.current); return () => observer.disconnect(); }, []);
  return <section id="design-notes" className="architecture-notes" aria-labelledby="architecture-notes-title" ref={section} data-visible={visible}><div className="container">
    <div className="architecture-heading"><div><p className="eyebrow">DESIGN NOTES / ENDURING REFERENCES</p><h2 id="architecture-notes-title">Built on<br /><em>enduring ideas.</em></h2><svg className="architecture-title-mark" viewBox="0 0 120 24" fill="none" aria-hidden="true"><path d="M2 18h16v-4h12v-4h12V6h12l6-4 6 4h12v4h12v4h12v4h16M18 22h84M56 10l4-4 4 4-4 4-4-4Z" stroke="currentColor" strokeWidth=".8" /></svg></div><p>Ancient architecture and philosophical images offer ways to think about sequence, attention, and relationship. These original study diagrams connect named references to contemporary design choices.</p></div>
    <div className="architecture-studies">{studies.map(({ number, kind, title, place, Drawing, description, principle, source, url }) => <article className="architecture-study" key={number} aria-labelledby={`architecture-study-${number}`}><div className="architecture-study-top"><span>{number}</span><p>{kind}</p></div><figure><Drawing /><figcaption>Interpretive study diagram</figcaption></figure><h3 id={`architecture-study-${number}`}>{title}</h3><p className="architecture-place">{place}</p><p className="architecture-description">{description}</p><p className="architecture-principle">{principle}</p><a className="architecture-source" href={url} target="_blank" rel="noopener noreferrer"><span>Reference / {source}</span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.2" /></svg></a></article>)}</div>
    <div className="architecture-closing"><span aria-hidden="true">∴</span><p>Intentional in structure. Connected in meaning. Accountable in use.</p><a href="#connection-game">Put connection into practice <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.2" /></svg></a></div>
  </div></section>;
}
