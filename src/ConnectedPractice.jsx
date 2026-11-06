import React, { useState } from 'react';
import BrandMark from './BrandMark';

const connections = [
  { id: 'education', title: 'Education', purpose: 'Create the conditions for people to learn, question, and carry knowledge forward.', link: '#curriculum', action: 'Explore curriculum work', path: 'M240 164V46', x: 240, y: 46 },
  { id: 'content', title: 'Content', purpose: 'Give an idea a clear form, with a purpose, an audience, and an accountable review.', link: '#ai-integration', action: 'Explore my AI practice', path: 'M240 164H74', x: 74, y: 164 },
  { id: 'communication', title: 'Communication', purpose: 'Build a shared language between institutions, teams, and the people they serve.', link: '#work', action: 'See the connected work', path: 'M240 164H406', x: 406, y: 164 },
  { id: 'brand', title: 'Brand & growth', purpose: 'Connect what an institution stands for with how it speaks, shows up, and earns trust.', link: '#contact', action: 'Start a conversation', path: 'M240 164V282', x: 240, y: 282 },
];

export default function ConnectedPractice() {
  const [selected, setSelected] = useState(connections[0].id);
  const active = connections.find(item => item.id === selected);

  return <aside className="practice-panel connected-practice" aria-label="Explore a connected practice">
    <div className="practice-panel-header"><span>THE CONNECTED PRACTICE</span><span className="panel-index">VT / 01</span></div>
    <div className="connection-field" aria-hidden="true">
      <svg viewBox="0 0 480 328" fill="none" className="practice-lines">
        <defs><radialGradient id="connection-light"><stop stopColor="#c5a36d" stopOpacity=".16" /><stop offset="1" stopColor="#c5a36d" stopOpacity="0" /></radialGradient></defs>
        <circle cx="240" cy="164" r="160" fill="url(#connection-light)" />
        <g stroke="currentColor" opacity=".17" strokeWidth=".8"><path d="M38 46H442M38 164H442M38 282H442M74 24V304M240 24V304M406 24V304" /><circle cx="240" cy="164" r="118" /><circle cx="240" cy="164" r="151" strokeDasharray="1 8" /></g>
        <g className="connection-orbit" stroke="#c5a36d" strokeWidth="1"><path d="M134 111a118 118 0 0 1 159-53M346 217a118 118 0 0 1-159 53" /><path d="M132 105v9h9M348 223v-9h-9" /></g>
        {connections.map(item => <g key={item.id} className={selected === item.id ? 'connection-branch is-selected' : 'connection-branch'}><path d={item.path} stroke="currentColor" strokeWidth="1.3" /><circle cx={item.x} cy={item.y} r="6" fill="currentColor" /><circle cx={item.x} cy={item.y} r="12" stroke="currentColor" strokeWidth=".7" /></g>)}
        <path d="M240 91c-41 36-56 65-56 86a56 56 0 0 0 112 0c0-21-15-50-56-86Z" fill="#18231f" stroke="#c5a36d" strokeWidth="1.3" />
        <path d="M240 91V230M184 177h112" stroke="#c5a36d" strokeWidth=".6" opacity=".45" />
        <text x="38" y="320" fill="currentColor" fontSize="7" fontFamily="monospace" letterSpacing="1.6">PURPOSE → STRUCTURE → POSSIBILITY</text>
      </svg>
      <BrandMark className="connection-mark" />
    </div>
    <div className="connection-selectors" role="group" aria-label="Explore connected disciplines">
      {connections.map((item, index) => <button type="button" key={item.id} aria-pressed={selected === item.id} aria-controls="connection-detail" onClick={() => setSelected(item.id)}><span aria-hidden="true">0{index + 1}</span>{item.title}<span className="connection-choice" aria-hidden="true">{selected === item.id ? '●' : '○'}</span></button>)}
    </div>
    <div id="connection-detail" className="connection-detail" role="region" aria-labelledby="connection-title">
      <div aria-live="polite" aria-atomic="true"><h2 id="connection-title">{active.title}</h2><p>{active.purpose}</p></div>
      <a href={active.link}>{active.action}<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" /></svg></a>
    </div>
  </aside>;
}
