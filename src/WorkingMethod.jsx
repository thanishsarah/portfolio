import React from 'react';

const principles = [
  { title: 'Agree the brief.', label: 'ATTENTION & INTENTION', text: 'Understand who the work is for, whose purpose it serves, and what needs to improve.' },
  { title: 'Build a shared language.', label: 'STRUCTURE & MEMORY', text: 'Give people clear rules, reusable patterns, and the reasoning they need to carry the work forward.' },
  { title: 'Keep human judgement.', label: 'AGENCY & RESPONSIBILITY', text: 'Make review and decision points explicit. Leave room to question, change direction, and say no.' },
  { title: 'Check the effect.', label: 'EVIDENCE & FEEDBACK', text: 'Look beyond the finished output. Gather evidence, consider who is affected, and decide what to preserve, revise, or stop.' },
];

export default function WorkingMethod() {
  return <section id="approach" className="method-section" aria-labelledby="method-title"><div className="container">
    <div className="method-heading"><div><p className="eyebrow">05 / HOW I APPROACH THE WORK</p><h2 id="method-title">Intention becomes structure.<br /><em>People give it meaning.</em></h2></div><p>Across design, education, and AI, I start with the relationships behind the output: the purpose, the people, and the consequences.</p></div>
    <ol className="method-principles">{principles.map((item, index) => <li key={item.title}><div className="method-topline"><span>0{index + 1}</span><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r={9 + index * 3} stroke="currentColor" strokeWidth=".8" /><path d="M24 3v42M3 24h42" stroke="currentColor" strokeWidth=".6" opacity=".45" /><circle cx="24" cy="24" r="2.5" fill="currentColor" /></svg></div><p className="method-label">{item.label}</p><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol>
    <div className="method-footnote"><svg className="method-return" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3v13h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.2" /></svg><p>A working principle: understand the rules, relationships, and consequences before shaping the output.</p><a href="#contact">Bring a challenge <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" /></svg></a></div>
  </div></section>;
}
