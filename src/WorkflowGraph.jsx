import React, { useState } from 'react';
import './workflow-graph.css';

const statusNames = {
  idle: 'Waiting', pending: 'Waiting', waiting: 'Waiting', ready: 'Ready', running: 'Running',
  complete: 'Complete', completed: 'Complete', passed: 'Passed', blocked: 'Blocked',
  stale: 'Stale', approved: 'Approved', released: 'Created', retired: 'Retired',
  active: 'Current', cancelled: 'Cancelled', error: 'Needs attention',
};

function StageGlyph({ index }) {
  return <svg viewBox="0 0 44 44" fill="none" aria-hidden="true" focusable="false">
    <circle className="workflow-glyph-orbit" cx="22" cy="22" r="18" stroke="currentColor" strokeWidth=".7" />
    {index === 0 ? <><path d="M22 11c-7 7-10 11-10 15a10 10 0 0 0 20 0c0-4-3-8-10-15Z" stroke="currentColor" strokeWidth="1.2" /><path d="M22 15v20" stroke="currentColor" strokeWidth=".7" /></> : index === 1 ? <><path d="M14 12h12l5 5v16H14V12Z" stroke="currentColor" strokeWidth="1.2" /><path d="M25 12v7h6M18 24h9M18 28h7" stroke="currentColor" strokeWidth="1" /></> : index === 2 ? <><path d="M13 16h18M13 23h18M13 30h18" stroke="currentColor" strokeWidth=".8" opacity=".5" /><path d="m15 16 3 3 5-6m-8 10 3 3 5-6m-8 10 3 3 5-6" stroke="currentColor" strokeWidth="1.2" /></> : index === 3 ? <><circle cx="22" cy="16" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M12 33v-3a10 10 0 0 1 20 0v3M17 28l4 4 7-8" stroke="currentColor" strokeWidth="1.2" /></> : <><path d="M12 16 22 10l10 6v15l-10 6-10-6V16Z" stroke="currentColor" strokeWidth="1.2" /><path d="m12 16 10 6 10-6M22 22v15" stroke="currentColor" strokeWidth=".8" /><circle cx="22" cy="22" r="2" fill="currentColor" /></>}
  </svg>;
}

export default function WorkflowGraph({ nodes = [], onExplore }) {
  const [selectedId, setSelectedId] = useState('brief');
  const active = nodes.find(node => node.id === selectedId) || nodes[0];
  if (!active) return null;

  return <div className="workflow-graph">
    <div className="workflow-graph-heading"><p>THE DEPENDENCIES</p><span>Select a stage to inspect its state.</span></div>
    <ol className="workflow-stages" aria-label="Example workflow stages">
      {nodes.map((node, index) => <li key={node.id} data-status={node.status}>
        <button type="button" aria-pressed={active.id === node.id} aria-controls="workflow-node-detail" onClick={() => { setSelectedId(node.id); onExplore?.(); }}>
          <span className="workflow-node-index" aria-hidden="true">0{index + 1}</span><StageGlyph index={index} />
          <span className="workflow-node-copy"><strong>{node.title}</strong><span><i aria-hidden="true" />{statusNames[node.status] || node.status}</span></span>
        </button>
      </li>)}
    </ol>
    <div id="workflow-node-detail" className="workflow-node-detail" role="region" aria-labelledby="workflow-node-title"><span className="workflow-detail-rule" aria-hidden="true" /><div><h3 id="workflow-node-title">{active.title}<span>{statusNames[active.status] || active.status}</span></h3><p>{active.detail}</p></div></div>
  </div>;
}
