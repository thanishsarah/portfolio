export const practiceLenses = [
  {
    id: 'adoption',
    title: 'Make AI usable',
    question: 'How does a new tool become a capability people can own?',
    description: 'AI adoption connects a useful brief, editorial judgement, shared working practices, and the people who carry them forward.',
    caseIds: ['ai-literacy', 'media-shala'],
    relationships: [
      { label: 'Purpose', description: 'Start with the work that needs to improve, and the people it needs to serve.' },
      { label: 'Judgement', description: 'Keep source checking, context, and approval with an accountable person.' },
      { label: 'Transfer', description: 'Turn individual experiments into guidance a team can understand and reuse.' },
    ],
  },
  {
    id: 'learning',
    title: 'Make learning travel',
    question: 'How does one learning intention stay coherent across people and classrooms?',
    description: 'Curriculum takes shape through the relationship between a learning idea, the educator interpreting it, and the experience in a classroom.',
    caseIds: ['media-shala', 'kedman-global'],
    relationships: [
      { label: 'Intention', description: 'Make the educational direction understandable before selecting the activity.' },
      { label: 'Shared language', description: 'Give educators a structure they can interpret with judgement.' },
      { label: 'Feedback', description: 'Let teaching experience inform how the curriculum develops.' },
    ],
  },
  {
    id: 'communication',
    title: 'Make meaning clear',
    question: 'How does an institution communicate without losing the meaning of its work?',
    description: 'Communication joins educational substance, audience understanding, creative craft, and the responsibility to make a claim carefully.',
    caseIds: ['kedman-global', 'paryavaran-baal-sansad'],
    relationships: [
      { label: 'Substance', description: 'Understand the programme or educational idea behind the message.' },
      { label: 'Perspective', description: 'Shape the explanation around what the audience needs to understand.' },
      { label: 'Trust', description: 'Make responsibility, context, and the basis for each claim visible.' },
    ],
  },
];

export function getPracticeLens(id) {
  return practiceLenses.find(lens => lens.id === id) || practiceLenses[0];
}

export function buildConversationBrief({ lensId, caseTitles = [], intent = 'leadership', challenge = '', demoSeen = false }) {
  const lens = getPracticeLens(lensId);
  const purpose = intent === 'advisory' ? 'a focused advisory engagement' : 'a leadership opportunity';
  const lines = ['Hello Vinayak,', '', `I would like to discuss ${purpose}.`, '', `Focus: ${lens.title}.`];
  if (challenge.trim()) lines.push(`The challenge: ${challenge.trim()}`);
  if (caseTitles.length) lines.push(`Work I explored: ${caseTitles.join('; ')}.`);
  if (demoSeen) lines.push('I also explored the ancient strategy game in your atelier.');
  lines.push('', 'Organisation / team:', 'Location / working arrangement:', 'A useful next conversation would be:');
  return lines.join('\n');
}
