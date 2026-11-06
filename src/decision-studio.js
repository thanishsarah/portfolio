// An original fictional scenario for the portfolio. No institutional material is used.
export const studioBrief = {
  title: 'An invitation to explore AI, together.',
  scenario: 'A fictional school is preparing a family invitation for a Saturday AI workshop.',
  facts: [
    'The example workshop runs on a Saturday, from 10 am to 12 pm.',
    'It is intended for learners aged 11–14, with a facilitator present.',
    'Activities explore AI-generated images and checking a factual claim.',
    'No learning outcome, image permission, or public promotion has been approved.',
  ],
  boundary: 'These facts belong to this invented example. They do not describe an actual event or institutional workflow.',
};

export const reviewChoices = [
  {
    id: 'promise',
    title: 'Ground the promise',
    question: 'What can the brief actually support?',
    reason: 'A two-hour activity does not establish mastery. Describe the learning opportunity without guaranteeing an outcome.',
    consequence: 'Families receive a proportionate expectation of the session.',
  },
  {
    id: 'audience',
    title: 'Name the audience',
    question: 'Who needs to understand this, and decide what?',
    reason: 'A family needs practical participation details. A school leader needs the proposal’s purpose and the decisions still open.',
    consequence: 'The same facts support a different message when the reader’s decision changes.',
  },
  {
    id: 'permission',
    title: 'Respect permission',
    question: 'What have we assumed about other people?',
    reason: 'Participation does not establish permission to publish a learner’s image. The brief contains no image approval.',
    consequence: 'The invitation does not turn attendance into an assumed promotional commitment.',
  },
];

export const initialReview = Object.freeze({ promise: false, audience: false, permission: false });

export function buildDecisionReview(review = initialReview, audience = 'families') {
  const applied = Object.fromEntries(reviewChoices.map(item => [item.id, review[item.id] === true]));
  const reader = audience === 'leadership' ? 'leadership' : 'families';
  const remaining = reviewChoices.filter(item => !applied[item.id]).map(item => item.title);
  const readerCopy = reader === 'leadership'
    ? 'For academic and communication leads: this proposed session gives learners aged 11–14 a facilitated introduction to AI-generated images and checking a factual claim. The example slot is Saturday, 10 am–12 pm. Learning outcomes and any promotional use need a separate review.'
    : 'For families of learners aged 11–14: this facilitated workshop explores AI-generated images and ways to check a factual claim. The example session is Saturday, 10 am–12 pm.';

  return {
    audience: reader,
    subject: applied.promise ? 'A morning to explore AI—and ask better questions.' : 'One morning. Complete AI mastery.',
    passages: [
      {
        id: 'promise',
        label: applied.promise ? 'Promise narrowed' : 'Unverified promise',
        reviewed: applied.promise,
        text: applied.promise
          ? 'An introduction to making, questioning, and checking with AI. This is a chance to explore a few ideas with guidance; mastery is not promised.'
          : 'Every learner will master AI in a single morning. AI makes learning effortless, with no guidance needed.',
      },
      {
        id: 'audience',
        label: applied.audience ? (reader === 'leadership' ? 'Leadership context' : 'Family context') : 'Audience unclear',
        reviewed: applied.audience,
        text: applied.audience ? readerCopy : 'Our AI-first initiative unlocks scalable transformation for every stakeholder. Join the next phase of the journey.',
      },
      {
        id: 'permission',
        label: applied.permission ? 'Permission separated' : 'Permission assumed',
        reviewed: applied.permission,
        text: applied.permission
          ? 'Taking part does not require photographs or personal details for promotion. Any later use of images would need a separate, appropriate permission process.'
          : 'Photographs of every learner will be shared across our promotional channels after the session.',
      },
    ],
    appliedCount: reviewChoices.length - remaining.length,
    remaining,
    readyForReview: remaining.length === 0,
    status: remaining.length === 0 ? 'Ready for human review' : 'Hold for revision',
    nextDecision: remaining.length === 0
      ? 'The message is clearer. A responsible owner still needs to verify the event, review the wording, and decide whether it should be used.'
      : 'Inspect the assumptions before the message moves forward. Choose an editorial change to see its effect.',
  };
}
