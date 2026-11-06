import { caseStudies } from './case-studies.js';
import { publicCurricula } from './curriculum.js';
import { internationalPractice } from './international.js';
import { practiceLenses } from './practice-model.js';

const sections = [
  { target: 'practice', label: 'The connected practice', detail: 'Explore the current AI integration remit and human decisions behind four workstreams.', keywords: 'challenge learning adoption communication practice' },
  { target: 'work', label: 'The work accounts', detail: 'Responsibility, contribution, scope, and public context.', keywords: 'cases projects evidence experience portfolio' },
  { target: 'decision-studio', label: 'The ancient game room', detail: 'Play a modern Royal Game of Ur against the Archivist.', keywords: 'play ancient ur mesopotamia strategy gaming game algorithm probability dice rosettes race' },
  { target: 'design-notes', label: 'Ancient architecture & enduring ideas', detail: 'Original studies of Chand Baori, Sanchi, and Indra’s net.', keywords: 'stepwell architecture ancient knowledge myth philosophy vedic geometry design' },
  { target: 'ai-integration', label: 'The current AI remit', detail: 'Four connected workstreams and the decisions people own.', keywords: 'artificial intelligence content creation brand promotion business' },
  { target: 'curriculum', label: 'The public curriculum index', detail: 'Ten public overviews of connected learning strands.', keywords: 'teaching educator programme lessons learning topics' },
  { target: 'international', label: 'International perspectives', detail: 'Frameworks, inquiry, and school communication.', keywords: 'IB aligned personalised learning global international' },
  { target: 'background', label: 'The professional background', detail: 'The roles and education behind the practice.', keywords: 'Vinayak Thanish biography education career resume cv film computer applications Berlin Jain' },
  { target: 'contact', label: 'Start a conversation', detail: 'Shape a leadership or advisory conversation brief.', keywords: 'email contact leadership consulting advisory hire opportunity' },
];

export const searchTypeLabels = Object.freeze({
  case: 'Work account',
  curriculum: 'Public curriculum overview',
  international: 'International perspective',
  lens: 'Practice lens',
  section: 'Go to section',
});

// Only newly written, public page content enters this index.
export const portfolioSearchIndex = [
  ...caseStudies.map(item => ({
    id: `case-${item.id}`, type: 'case', target: item.id,
    label: item.shortTitle, detail: item.title,
    keywords: [item.summary, item.role, item.scope, item.context, ...item.contribution].join(' '),
  })),
  ...publicCurricula.map(item => ({
    id: `curriculum-${item.id}`, type: 'curriculum', target: 'curriculum',
    label: item.title, detail: item.summary,
    keywords: [item.category, item.scope, ...item.focus].join(' '),
  })),
  ...internationalPractice.areas.map((item, index) => ({
    id: `international-${index}`, type: 'international', target: 'international',
    label: item.title, detail: item.summary,
    keywords: internationalPractice.skills.join(' '),
  })),
  ...practiceLenses.map(item => ({
    id: `lens-${item.id}`, type: 'lens', target: item.id,
    label: item.title, detail: item.question,
    keywords: [item.description, ...item.relationships.map(relationship => `${relationship.label} ${relationship.description}`)].join(' '),
  })),
  ...sections.map(item => ({ ...item, id: `section-${item.target}`, type: 'section' })),
];

const typePriority = { case: 0, curriculum: 1, lens: 2, international: 3, section: 4 };
const suggestedIds = ['case-ai-literacy', 'case-media-shala', 'section-decision-studio', 'curriculum-digital-citizenship', 'lens-learning', 'section-contact'];

export function normalizeSearchText(value = '') {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenScore(token, label, detail, keywords) {
  const labelWords = label.split(' ');
  const detailWords = detail.split(' ');
  const keywordWords = keywords.split(' ');
  if (labelWords.includes(token)) return 36;
  if (labelWords.some(word => word.startsWith(token))) return 26;
  if (label.includes(token)) return 18;
  if (detailWords.includes(token)) return 12;
  if (detailWords.some(word => word.startsWith(token))) return 9;
  if (detail.includes(token)) return 7;
  if (keywordWords.includes(token)) return 6;
  if (keywordWords.some(word => word.startsWith(token))) return 4;
  return keywords.includes(token) ? 2 : 0;
}

export function searchPortfolio(query = '', { index = portfolioSearchIndex, limit = 10 } = {}) {
  const maximum = Number.isFinite(limit) ? Math.max(0, Math.min(30, Math.floor(limit))) : 10;
  const normalized = normalizeSearchText(String(query).slice(0, 160));
  if (!normalized) {
    const suggestions = suggestedIds.map(id => index.find(item => item.id === id)).filter(Boolean);
    return [...suggestions, ...index.filter(item => !suggestions.includes(item))].slice(0, maximum);
  }

  const tokens = [...new Set(normalized.split(' '))].slice(0, 12);
  return index.map(entry => {
    const label = normalizeSearchText(entry.label);
    const detail = normalizeSearchText(entry.detail);
    const keywords = normalizeSearchText(entry.keywords);
    const scores = tokens.map(token => tokenScore(token, label, detail, keywords));
    if (scores.some(score => score === 0)) return null;
    const phrase = label === normalized ? 200 : label.startsWith(normalized) ? 100 : label.includes(normalized) ? 60 : 0;
    return { entry, score: phrase + scores.reduce((total, score) => total + score, 0) };
  }).filter(Boolean).sort((a, b) => b.score - a.score
    || typePriority[a.entry.type] - typePriority[b.entry.type]
    || a.entry.label.localeCompare(b.entry.label, 'en')
    || a.entry.id.localeCompare(b.entry.id, 'en')).slice(0, maximum).map(item => item.entry);
}
