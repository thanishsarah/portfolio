import { buildDecisionReview, initialReview, reviewChoices } from './decision-studio.js';

export const WORKFLOW_SCHEMA = 'vt-local-workflow/1';
export const JOURNAL_LIMIT = 128;
export const workflowGraph = Object.freeze([
  { id: 'brief', title: 'Source brief', dependsOn: [] },
  { id: 'draft', title: 'Working draft', dependsOn: ['brief'] },
  { id: 'checks', title: 'Editorial checks', dependsOn: ['draft'] },
  { id: 'review', title: 'Human decision', dependsOn: ['checks'] },
  { id: 'snapshot', title: 'Local snapshot', dependsOn: ['review'] },
]);

// Kahn's algorithm validates the same dependency graph the interface displays.
export function topologicalOrder(graph) {
  if (!Array.isArray(graph)) throw new Error('A workflow must be an array of nodes.');
  const nodes = new Map();
  for (const node of graph) {
    if (!node || typeof node.id !== 'string' || !node.id || nodes.has(node.id) || !Array.isArray(node.dependsOn)) throw new Error('Workflow node IDs must be unique and dependencies must be arrays.');
    nodes.set(node.id, node);
  }
  const incoming = new Map();
  const outgoing = new Map([...nodes.keys()].map(id => [id, []]));
  for (const node of graph) {
    if (new Set(node.dependsOn).size !== node.dependsOn.length) throw new Error('A dependency may appear only once.');
    incoming.set(node.id, node.dependsOn.length);
    for (const dependency of node.dependsOn) {
      if (!nodes.has(dependency)) throw new Error('A workflow dependency is missing.');
      outgoing.get(dependency).push(node.id);
    }
  }
  const queue = graph.filter(node => !incoming.get(node.id)).map(node => node.id);
  const ordered = [];
  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index]; ordered.push(id);
    for (const dependent of outgoing.get(id)) {
      incoming.set(dependent, incoming.get(dependent) - 1);
      if (!incoming.get(dependent)) queue.push(dependent);
    }
  }
  if (ordered.length !== graph.length) throw new Error('The workflow contains a dependency cycle.');
  return ordered;
}

function checksum(text) {
  // A repeatability checksum, not a signature or a security guarantee.
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) { hash ^= text.charCodeAt(index); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function compileWorkflow({ review, audience, revision }) {
  if (!Number.isSafeInteger(revision) || revision < 1) throw new Error('A positive revision is required.');
  const result = buildDecisionReview(review, audience);
  const checks = reviewChoices.map(choice => ({ id: choice.id, label: choice.title, passed: review?.[choice.id] === true }));
  const artifact = { ...result, revision, checks, evaluatedNodes: topologicalOrder(workflowGraph).filter(id => !['review', 'snapshot'].includes(id)) };
  return { ...artifact, checksum: checksum(JSON.stringify(artifact)) };
}

function initialCore(revision = 1, seq = 0) {
  return { revision, seq, review: { ...initialReview }, audience: 'families', phase: 'idle', run: null, artifact: null, approval: null, snapshots: [], activeSnapshot: null, error: null };
}

export function createWorkflow() {
  const core = initialCore();
  return { ...core, journal: [], checkpoint: initialCore() };
}

function coreOf(state) { const { journal, checkpoint, ...core } = state; return core; }
function isCurrent(core) { return Boolean(core.artifact && core.artifact.revision === core.revision); }
function checksPass(core) { return isCurrent(core) && core.artifact.checks.every(check => check.passed); }
function approvedCurrent(core) { return checksPass(core) && core.approval?.revision === core.revision && core.approval?.checksum === core.artifact.checksum; }
function invalidate(core, edits) {
  return { ...core, ...edits, revision: core.revision + 1, run: null, approval: null, activeSnapshot: null, error: null, phase: core.artifact || core.run ? 'stale' : 'idle' };
}

// Returning the exact same object rejects an invalid command or obsolete worker reply.
function applyCore(core, action) {
  if (!action || typeof action.type !== 'string') return core;
  switch (action.type) {
    case 'SET_REVIEW': {
      if (core.phase === 'retired' || !reviewChoices.some(choice => choice.id === action.id) || typeof action.value !== 'boolean' || core.review[action.id] === action.value) return core;
      return invalidate(core, { review: { ...core.review, [action.id]: action.value } });
    }
    case 'SET_AUDIENCE': {
      if (core.phase === 'retired' || !['families', 'leadership'].includes(action.audience) || (core.audience === action.audience && core.review.audience)) return core;
      return invalidate(core, { audience: action.audience, review: { ...core.review, audience: true } });
    }
    case 'RUN':
      if (['running', 'retired'].includes(core.phase)) return core;
      return { ...core, phase: 'running', run: { id: core.seq + 1, revision: core.revision }, approval: null, activeSnapshot: null, error: null };
    case 'CANCEL':
      if (core.phase !== 'running') return core;
      return { ...core, phase: 'cancelled', run: null, approval: null, activeSnapshot: null };
    case 'WORKER_RESULT': {
      if (core.phase !== 'running' || action.runId !== core.run?.id || action.revision !== core.revision) return core;
      const expected = compileWorkflow(core);
      let matches = false;
      try { matches = JSON.stringify(action.artifact) === JSON.stringify(expected); } catch { /* A malformed structured-cloneable packet is rejected. */ }
      if (!matches) return applyCore(core, { type: 'RESULT_REJECTED', runId: action.runId, revision: action.revision });
      return { ...core, phase: 'ready', run: null, artifact: expected, approval: null, activeSnapshot: null, error: null };
    }
    case 'RESULT_REJECTED':
      if (core.phase !== 'running' || action.runId !== core.run?.id || action.revision !== core.revision) return core;
      return { ...core, phase: 'error', run: null, approval: null, activeSnapshot: null, error: 'The local result did not match the current rules. Build the example again.' };
    case 'WORKER_ERROR':
      if (core.phase !== 'running' || action.runId !== core.run?.id || action.revision !== core.revision) return core;
      return { ...core, phase: 'error', run: null, approval: null, activeSnapshot: null, error: 'The local checks could not finish. You can build the example again.' };
    case 'APPROVE':
      if (core.phase !== 'ready' || !checksPass(core)) return core;
      return { ...core, phase: 'approved', approval: { revision: core.revision, checksum: core.artifact.checksum } };
    case 'RELEASE': {
      if (core.phase !== 'approved' || !approvedCurrent(core)) return core;
      const snapshot = { id: core.seq + 1, revision: core.revision, artifact: core.artifact };
      return { ...core, phase: 'released', snapshots: [...core.snapshots, snapshot].slice(-3), activeSnapshot: snapshot.id };
    }
    case 'RETIRE':
      if (core.phase === 'retired' || !(core.artifact || core.run)) return core;
      return { ...core, phase: 'retired', run: null, approval: null, activeSnapshot: null, error: null };
    case 'RESTORE':
      if (core.phase !== 'retired') return core;
      return { ...core, phase: core.artifact ? 'stale' : 'idle', revision: core.revision + 1, run: null, approval: null, activeSnapshot: null, error: null };
    case 'RESET':
      return initialCore(core.revision + 1, core.seq);
    default:
      return core;
  }
}

export function workflowReducer(state, action) {
  const core = coreOf(state);
  const next = applyCore(core, action);
  if (next === core) return state;
  let event = { type: action.type, seq: core.seq + 1 };
  if (action.type === 'SET_REVIEW') event = { ...event, id: action.id, value: action.value };
  if (action.type === 'SET_AUDIENCE') event.audience = action.audience;
  if (['WORKER_RESULT', 'WORKER_ERROR', 'RESULT_REJECTED'].includes(action.type)) {
    event.runId = action.runId; event.revision = action.revision;
    if (action.type === 'WORKER_RESULT') {
      if (next.phase === 'error') event.type = 'RESULT_REJECTED';
      else event.artifact = JSON.parse(JSON.stringify(next.artifact));
    }
  }
  const advanced = { ...next, seq: event.seq };
  const journal = [...state.journal, event];
  let checkpoint = state.checkpoint;
  if (journal.length > JOURNAL_LIMIT) {
    const oldest = journal.shift();
    const folded = applyCore(checkpoint, oldest);
    checkpoint = { ...folded, seq: oldest.seq };
  }
  return { ...advanced, journal, checkpoint };
}

export function exportWorkflowTrace(state) {
  return JSON.parse(JSON.stringify({ schema: WORKFLOW_SCHEMA, checkpoint: state.checkpoint, events: state.journal }));
}

function validCheckpoint(core) {
  const phases = ['idle', 'stale', 'running', 'ready', 'approved', 'released', 'retired', 'cancelled', 'error'];
  const positive = value => Number.isSafeInteger(value) && value > 0;
  const nullable = (value, check) => value === null || check(value);
  const artifact = value => Boolean(value && positive(value.revision) && value.revision <= core.revision && typeof value.subject === 'string' && /^[a-f0-9]{8}$/.test(value.checksum) && Array.isArray(value.checks) && value.checks.length === reviewChoices.length && value.checks.every((check, index) => check.id === reviewChoices[index].id && typeof check.passed === 'boolean') && Array.isArray(value.passages) && value.passages.length === 3 && value.passages.every(passage => typeof passage.text === 'string'));
  return Boolean(core && Number.isSafeInteger(core.seq) && core.seq >= 0 && positive(core.revision) && phases.includes(core.phase) && ['families', 'leadership'].includes(core.audience) && core.review && reviewChoices.every(choice => typeof core.review[choice.id] === 'boolean') && nullable(core.run, value => value && positive(value.id) && value.id <= core.seq && value.revision === core.revision) && nullable(core.artifact, artifact) && nullable(core.approval, value => value && positive(value.revision) && value.revision === core.revision && typeof value.checksum === 'string') && Array.isArray(core.snapshots) && core.snapshots.length <= 3 && core.snapshots.every(snapshot => snapshot && positive(snapshot.id) && snapshot.id <= core.seq && positive(snapshot.revision) && artifact(snapshot.artifact)) && nullable(core.activeSnapshot, value => positive(value) && core.snapshots.some(snapshot => snapshot.id === value)) && (core.error === null || typeof core.error === 'string') && (core.phase !== 'running' || core.run !== null));
}

export function replayWorkflow(trace) {
  if (trace?.schema !== WORKFLOW_SCHEMA || !trace.checkpoint || !Array.isArray(trace.events) || trace.events.length > JOURNAL_LIMIT) throw new Error('Unsupported local session trace.');
  let core = JSON.parse(JSON.stringify(trace.checkpoint));
  if (!validCheckpoint(core)) throw new Error('Invalid session checkpoint.');
  for (const event of trace.events) {
    if (event.seq !== core.seq + 1) throw new Error('Session event sequence is incomplete.');
    const next = applyCore(core, event);
    if (next === core) throw new Error('Session includes an invalid transition.');
    core = { ...next, seq: event.seq };
  }
  return { ...core, checkpoint: JSON.parse(JSON.stringify(trace.checkpoint)), journal: JSON.parse(JSON.stringify(trace.events)) };
}

export function getWorkflowView(state) {
  const current = isCurrent(state);
  const passing = checksPass(state);
  const retired = state.phase === 'retired';
  const approved = approvedCurrent(state);
  const label = { idle: 'Ready to build', stale: 'Revision needs a new build', running: 'Checking the current revision', ready: passing ? 'Ready for a human decision' : 'Changes needed', approved: 'Example approved for this revision', released: 'Local snapshot created', retired: 'Example retired', cancelled: 'Build cancelled', error: 'Build needs another attempt' }[state.phase];
  const blockers = [];
  if (retired) blockers.push('Restore the example before changing or building it.');
  else if (!current || !['ready', 'approved', 'released'].includes(state.phase)) blockers.push('Build the current revision before reviewing it.');
  else for (const check of state.artifact.checks) if (!check.passed) blockers.push(check.label);
  if (!blockers.length && !approved) blockers.push('A person must approve this example before a local snapshot can be created.');
  const commonStatus = retired ? 'retired' : state.phase === 'stale' ? 'stale' : null;
  const nodes = workflowGraph.map(node => {
    let status = commonStatus || 'waiting';
    let detail = '';
    if (!commonStatus) {
      if (node.id === 'brief') { status = 'ready'; detail = `Revision ${state.revision} · fictional source facts`; }
      if (node.id === 'draft') { status = state.phase === 'running' ? 'running' : current ? 'ready' : 'waiting'; detail = current ? `Built from revision ${state.revision}` : 'A build creates a revision-bound draft.'; }
      if (node.id === 'checks') { status = state.phase === 'running' ? 'running' : current ? passing ? 'passed' : 'blocked' : 'waiting'; detail = current ? `${state.artifact.checks.filter(check => check.passed).length} of 3 editorial rules satisfied` : 'Promise, audience, and permission rules.'; }
      if (node.id === 'review') { status = approved ? 'approved' : passing && state.phase === 'ready' ? 'ready' : 'blocked'; detail = approved ? 'Explicit approval matches this revision.' : 'A human decision is required.'; }
      if (node.id === 'snapshot') { status = state.phase === 'released' && state.activeSnapshot ? 'released' : 'waiting'; detail = status === 'released' ? 'A sample snapshot exists in this page.' : 'An approved example can become a local snapshot.'; }
    } else if (node.id === 'brief' && !retired) { status = 'ready'; detail = `Revision ${state.revision} · the fictional source facts remain available.`; }
    else detail = retired ? 'Retained in session history; fresh review is required after restore.' : 'An input changed. Rebuild to refresh dependent work.';
    return { ...node, status, detail };
  });
  return { label, blockers, nodes, artifactIsCurrent: current, readyForReview: passing && state.phase === 'ready', canRun: !['running', 'retired'].includes(state.phase), canCancel: state.phase === 'running', canApprove: passing && state.phase === 'ready', canRelease: state.phase === 'approved' && approved, canRetire: !retired && Boolean(state.artifact || state.run), canRestore: retired, latestSnapshot: state.snapshots.at(-1) || null, previousSnapshot: state.snapshots.at(-2) || null };
}
