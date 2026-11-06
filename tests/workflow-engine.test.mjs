import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORKFLOW_SCHEMA,
  JOURNAL_LIMIT,
  workflowGraph,
  topologicalOrder,
  createWorkflow,
  workflowReducer,
  compileWorkflow,
  getWorkflowView,
  exportWorkflowTrace,
  replayWorkflow,
} from '../src/workflow-engine.js';

function edit(state, id, value = true) {
  return workflowReducer(state, { type: 'SET_REVIEW', id, value });
}

function satisfyRules(state = createWorkflow(), audience = 'families') {
  state = edit(state, 'promise');
  state = edit(state, 'permission');
  return workflowReducer(state, { type: 'SET_AUDIENCE', audience });
}

function begin(state) {
  return workflowReducer(state, { type: 'RUN' });
}

function resultFor(state) {
  assert.equal(state.phase, 'running', 'test setup requires an active build');
  return {
    type: 'WORKER_RESULT',
    runId: state.run.id,
    revision: state.revision,
    artifact: compileWorkflow(state),
  };
}

function build(state) {
  const running = begin(state);
  return workflowReducer(running, resultFor(running));
}

function release(state = satisfyRules()) {
  state = build(state);
  state = workflowReducer(state, { type: 'APPROVE' });
  return workflowReducer(state, { type: 'RELEASE' });
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

test('dependency ordering respects a branched graph without changing its input', () => {
  const graph = deepFreeze([
    { id: 'release', dependsOn: ['evidence', 'permission'] },
    { id: 'permission', dependsOn: ['brief'] },
    { id: 'independent', dependsOn: [] },
    { id: 'evidence', dependsOn: ['draft'] },
    { id: 'draft', dependsOn: ['brief'] },
    { id: 'brief', dependsOn: [] },
  ]);
  const before = JSON.stringify(graph);
  const order = topologicalOrder(graph);
  assert.equal(new Set(order).size, graph.length);
  for (const node of graph) {
    for (const dependency of node.dependsOn) {
      assert.ok(order.indexOf(dependency) < order.indexOf(node.id), `${dependency} must precede ${node.id}`);
    }
  }
  assert.deepEqual(topologicalOrder(graph), order, 'the same graph has a repeatable order');
  assert.equal(JSON.stringify(graph), before);
  assert.deepEqual(topologicalOrder(workflowGraph), ['brief', 'draft', 'checks', 'review', 'snapshot']);
});

test('invalid graphs reject duplicate IDs, missing or repeated dependencies, and cycles', () => {
  const invalid = [
    null,
    {},
    [{ id: 'a', dependsOn: [] }, { id: 'a', dependsOn: [] }],
    [{ id: 'a', dependsOn: ['missing'] }],
    [{ id: 'a', dependsOn: [] }, { id: 'b', dependsOn: ['a', 'a'] }],
    [{ id: 'a', dependsOn: ['a'] }],
    [{ id: 'a', dependsOn: ['b'] }, { id: 'b', dependsOn: ['a'] }],
    [{ id: 'a', dependsOn: 'brief' }],
  ];
  for (const graph of invalid) assert.throws(() => topologicalOrder(graph));
});

test('an unchecked draft remains blocked and cannot acquire approval or a snapshot', () => {
  const state = build(createWorkflow());
  const view = getWorkflowView(state);
  assert.equal(state.phase, 'ready');
  assert.equal(state.artifact.checks.filter(check => check.passed).length, 0);
  assert.equal(view.canApprove, false);
  assert.equal(view.canRelease, false);
  assert.equal(view.nodes.find(node => node.id === 'checks').status, 'blocked');
  assert.equal(workflowReducer(state, { type: 'APPROVE' }), state);
  assert.equal(workflowReducer(state, { type: 'RELEASE' }), state);
  assert.deepEqual(state.snapshots, []);
});

test('passing checks still require an explicit human decision before release', () => {
  const checked = build(satisfyRules());
  assert.equal(getWorkflowView(checked).canApprove, true);
  assert.equal(getWorkflowView(checked).canRelease, false);
  assert.equal(workflowReducer(checked, { type: 'RELEASE' }), checked);
  const approved = workflowReducer(checked, { type: 'APPROVE' });
  assert.equal(approved.approval.revision, approved.revision);
  assert.equal(approved.approval.checksum, approved.artifact.checksum);
  assert.equal(getWorkflowView(approved).canRelease, true);
  const released = workflowReducer(approved, { type: 'RELEASE' });
  assert.equal(released.phase, 'released');
  assert.equal(released.snapshots.length, 1);
  assert.equal(released.snapshots[0].revision, released.revision);
  assert.equal(released.activeSnapshot, released.snapshots[0].id);
  assert.equal(workflowReducer(released, { type: 'RELEASE' }), released, 'release is not duplicated by a second click');
});

test('changing an input invalidates approval and preserves the earlier snapshot only as history', () => {
  const original = release();
  for (const action of [
    { type: 'SET_REVIEW', id: 'permission', value: false },
    { type: 'SET_AUDIENCE', audience: 'leadership' },
  ]) {
    const changed = workflowReducer(original, action);
    assert.ok(changed.revision > original.revision);
    assert.equal(changed.phase, 'stale');
    assert.equal(changed.approval, null);
    assert.equal(changed.activeSnapshot, null);
    assert.equal(getWorkflowView(changed).artifactIsCurrent, false);
    assert.equal(getWorkflowView(changed).canRelease, false);
    assert.equal(workflowReducer(changed, { type: 'APPROVE' }), changed);
    assert.equal(workflowReducer(changed, { type: 'RELEASE' }), changed);
    assert.deepEqual(changed.snapshots, original.snapshots);
    assert.equal(original.phase, 'released');
  }
});

test('editing during a build rejects the old worker result, including after a new run starts', () => {
  const firstRun = begin(satisfyRules());
  const lateResult = resultFor(firstRun);
  const edited = workflowReducer(firstRun, { type: 'SET_AUDIENCE', audience: 'leadership' });
  assert.equal(edited.run, null);
  assert.equal(workflowReducer(edited, lateResult), edited);
  const nextRun = begin(edited);
  assert.ok(nextRun.run.id > firstRun.run.id);
  assert.ok(nextRun.revision > firstRun.revision);
  assert.equal(workflowReducer(nextRun, lateResult), nextRun);
  const completed = workflowReducer(nextRun, resultFor(nextRun));
  assert.equal(completed.artifact.audience, 'leadership');
  assert.equal(completed.artifact.revision, edited.revision);
});

test('cancellation rejects late success and error replies without creating an artifact', () => {
  const running = begin(satisfyRules());
  const lateResult = resultFor(running);
  const cancelled = workflowReducer(running, { type: 'CANCEL' });
  assert.equal(cancelled.phase, 'cancelled');
  assert.equal(cancelled.run, null);
  assert.equal(cancelled.artifact, null);
  assert.equal(workflowReducer(cancelled, lateResult), cancelled);
  assert.equal(workflowReducer(cancelled, { ...lateResult, type: 'WORKER_ERROR' }), cancelled);
  const retry = begin(cancelled);
  assert.notEqual(retry.run.id, running.run.id);
  assert.equal(workflowReducer(retry, lateResult), retry);
  assert.equal(workflowReducer(retry, resultFor(retry)).phase, 'ready');
});

test('retirement blocks work and restoration requires a fresh revision, build, and approval', () => {
  const published = release();
  const retired = workflowReducer(published, { type: 'RETIRE' });
  const view = getWorkflowView(retired);
  assert.equal(retired.approval, null);
  assert.equal(retired.activeSnapshot, null);
  assert.equal(view.canRun, false);
  assert.equal(view.canApprove, false);
  assert.equal(view.canRelease, false);
  assert.equal(view.canRestore, true);
  assert.ok(view.nodes.every(node => node.status === 'retired'));
  for (const action of [
    { type: 'RUN' }, { type: 'APPROVE' }, { type: 'RELEASE' },
    { type: 'SET_REVIEW', id: 'promise', value: false },
    { type: 'SET_AUDIENCE', audience: 'leadership' },
  ]) assert.equal(workflowReducer(retired, action), retired);
  const restored = workflowReducer(retired, { type: 'RESTORE' });
  assert.ok(restored.revision > published.revision);
  assert.equal(restored.phase, 'stale');
  assert.equal(restored.approval, null);
  assert.equal(getWorkflowView(restored).canRelease, false);
  assert.equal(workflowReducer(restored, { type: 'APPROVE' }), restored);
  assert.equal(workflowReducer(restored, { type: 'RESTORE' }), restored);
  const rebuilt = build(restored);
  assert.equal(rebuilt.approval, null);
  assert.equal(getWorkflowView(rebuilt).canApprove, true);
  assert.equal(getWorkflowView(rebuilt).canRelease, false);
  assert.equal(release(restored).phase, 'released');
});

test('retiring an in-flight build prevents that worker reply from reviving it', () => {
  const running = begin(satisfyRules());
  const lateResult = resultFor(running);
  const retired = workflowReducer(running, { type: 'RETIRE' });
  assert.equal(workflowReducer(retired, lateResult), retired);
  const restored = workflowReducer(retired, { type: 'RESTORE' });
  assert.equal(restored.phase, 'idle');
  assert.ok(restored.revision > running.revision);
  assert.equal(workflowReducer(restored, lateResult), restored);
});

test('worker errors and mismatched results fail visibly and allow a fresh retry', () => {
  for (const reply of ['error', 'wrong-result']) {
    const running = begin(satisfyRules());
    const event = reply === 'error'
      ? { type: 'WORKER_ERROR', runId: running.run.id, revision: running.revision }
      : { ...resultFor(running), artifact: { ...compileWorkflow(running), subject: 'An unrelated result' } };
    const failed = workflowReducer(running, event);
    assert.equal(failed.phase, 'error');
    assert.equal(failed.run, null);
    assert.equal(failed.approval, null);
    assert.equal(typeof failed.error, 'string');
    assert.equal(getWorkflowView(failed).canRun, true);
    assert.equal(getWorkflowView(failed).canApprove, false);
    assert.equal(getWorkflowView(failed).canRelease, false);
    assert.equal(build(failed).phase, 'ready');
  }
});

test('malformed structured-cloneable worker artifacts cannot crash the reducer', () => {
  const cyclic = {}; cyclic.self = cyclic;
  for (const artifact of [null, {}, cyclic, { unexpected: 1n }]) {
    const running = begin(satisfyRules());
    let failed;
    assert.doesNotThrow(() => {
      failed = workflowReducer(running, { type: 'WORKER_RESULT', runId: running.run.id, revision: running.revision, artifact });
    });
    assert.equal(failed.phase, 'error');
    assert.equal(failed.run, null);
    assert.equal(failed.approval, null);
  }
});

test('reset does not reuse a previous run identity or accept its result', () => {
  const running = begin(satisfyRules());
  const lateResult = resultFor(running);
  const reset = workflowReducer(running, { type: 'RESET' });
  assert.equal(reset.phase, 'idle');
  assert.equal(reset.artifact, null);
  assert.equal(reset.approval, null);
  assert.deepEqual(reset.snapshots, []);
  assert.ok(reset.revision > running.revision);
  const newRun = begin(reset);
  assert.ok(newRun.run.id > running.run.id);
  assert.equal(workflowReducer(newRun, lateResult), newRun);
  assert.equal(workflowReducer(newRun, { ...lateResult, revision: newRun.revision }), newRun, 'matching only revision is insufficient');
  assert.equal(workflowReducer(newRun, resultFor(newRun)).phase, 'ready');
});

test('snapshot history is bounded while each saved revision remains identifiable', () => {
  let state = satisfyRules();
  const saved = [];
  for (let index = 0; index < 5; index += 1) {
    state = workflowReducer(state, { type: 'SET_AUDIENCE', audience: index % 2 ? 'leadership' : 'families' });
    state = release(state);
    saved.push(state.activeSnapshot);
  }
  assert.equal(state.snapshots.length, 3);
  assert.deepEqual(state.snapshots.map(snapshot => snapshot.id), saved.slice(-3));
  assert.equal(getWorkflowView(state).latestSnapshot.id, saved.at(-1));
  assert.equal(getWorkflowView(state).previousSnapshot.id, saved.at(-2));
});

test('replay reproduces complete state after journal checkpoint compaction', () => {
  let state = createWorkflow();
  for (let index = 0; index < 40; index += 1) {
    state = edit(state, 'promise', !state.review.promise);
    state = satisfyRules(state, index % 2 ? 'leadership' : 'families');
    state = release(state);
    state = workflowReducer(state, { type: 'RETIRE' });
    state = workflowReducer(state, { type: 'RESTORE' });
    if (index % 9 === 0) state = workflowReducer(state, { type: 'RESET' });
  }
  assert.ok(state.seq > JOURNAL_LIMIT);
  assert.equal(state.journal.length, JOURNAL_LIMIT);
  assert.ok(state.checkpoint.seq > 0);
  assert.equal(state.journal[0].seq, state.checkpoint.seq + 1);
  const trace = exportWorkflowTrace(state);
  const replayed = replayWorkflow(trace);
  assert.deepEqual(replayed, state);
  assert.deepEqual(exportWorkflowTrace(replayed), trace);
  assert.deepEqual(replayWorkflow(trace), replayed);
});

test('exported traces are detached from state, and malformed traces fail explicitly', () => {
  const state = release();
  const trace = exportWorkflowTrace(state);
  trace.checkpoint.review.promise = true;
  trace.events[0].type = 'CHANGED_OUTSIDE_THE_ENGINE';
  assert.equal(state.checkpoint.review.promise, false);
  assert.notEqual(state.journal[0].type, trace.events[0].type);
  for (const invalid of [
    null,
    { schema: 'other', checkpoint: {}, events: [] },
    { schema: WORKFLOW_SCHEMA, checkpoint: { seq: 0, revision: 1 }, events: [] },
    { ...exportWorkflowTrace(state), events: Array(JOURNAL_LIMIT + 1).fill({}) },
    { ...exportWorkflowTrace(state), events: [{ seq: 2, type: 'RUN' }] },
    { ...exportWorkflowTrace(state), events: [{ seq: 1, type: 'UNKNOWN' }] },
  ]) assert.throws(() => replayWorkflow(invalid));
});

test('sequence numbers belong to the engine rather than the caller', () => {
  const state = workflowReducer(createWorkflow(), { type: 'SET_REVIEW', id: 'promise', value: true, seq: 9000 });
  assert.equal(state.seq, 1);
  assert.equal(state.journal[0].seq, 1);
  assert.deepEqual(replayWorkflow(exportWorkflowTrace(state)), state);
});

test('the journal owns its accepted result instead of retaining a mutable worker packet', () => {
  const running = begin(satisfyRules());
  const packet = resultFor(running);
  const state = workflowReducer(running, packet);
  const before = exportWorkflowTrace(state);
  packet.artifact.passages[0].text = 'Changed after dispatch';
  packet.artifact.checks[0].passed = false;
  assert.deepEqual(exportWorkflowTrace(state), before);
  assert.deepEqual(replayWorkflow(exportWorkflowTrace(state)), state);
});

test('reduction and compilation preserve frozen input state through compaction', () => {
  let state = createWorkflow();
  for (let index = 0; index < JOURNAL_LIMIT + 8; index += 1) {
    const before = JSON.stringify(state);
    deepFreeze(state);
    const next = edit(state, 'promise', !state.review.promise);
    assert.equal(JSON.stringify(state), before);
    assert.notEqual(next, state);
    state = next;
  }
  state = satisfyRules(state);
  const input = deepFreeze({ review: { ...state.review }, audience: state.audience, revision: state.revision });
  const first = compileWorkflow(input);
  assert.deepEqual(compileWorkflow(input), first);
  assert.notEqual(compileWorkflow({ ...input, revision: input.revision + 1 }).checksum, first.checksum);
  assert.notEqual(compileWorkflow({ ...input, audience: 'leadership' }).checksum, first.checksum);
  assert.throws(() => compileWorkflow({ ...input, revision: 0 }));
  const running = begin(deepFreeze(state));
  const packet = deepFreeze(resultFor(running));
  assert.doesNotThrow(() => workflowReducer(deepFreeze(running), packet));
});

test('invalid and repeated commands do not create misleading history entries', () => {
  const state = createWorkflow();
  for (const action of [
    null, {}, { type: 'UNKNOWN' }, { type: 'CANCEL' }, { type: 'APPROVE' },
    { type: 'RELEASE' }, { type: 'RETIRE' }, { type: 'RESTORE' },
    { type: 'SET_REVIEW', id: 'unknown', value: true },
    { type: 'SET_REVIEW', id: 'promise', value: 'yes' },
    { type: 'SET_AUDIENCE', audience: 'unknown' },
  ]) assert.equal(workflowReducer(state, action), state);
  assert.deepEqual(state.journal, []);
  const edited = edit(state, 'promise');
  assert.equal(edit(edited, 'promise'), edited);
});

test('an editorial change keeps source facts available while invalidating dependent work', () => {
  let state = satisfyRules();
  state = begin(state);
  state = workflowReducer(state, resultFor(state));
  state = workflowReducer(state, { type: 'APPROVE' });
  state = edit(state, 'promise', false);
  const nodes = getWorkflowView(state).nodes;
  assert.equal(nodes.find(node => node.id === 'brief').status, 'ready');
  for (const id of ['draft', 'checks', 'review', 'snapshot']) assert.equal(nodes.find(node => node.id === id).status, 'stale');
  assert.equal(state.approval, null);
});
