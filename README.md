# Vinayak Thanish — Build what carries forward

A leadership-first portfolio connecting AI integration, learning systems, creative communication, and the people who bring them into practice. India and international opportunities have equal visibility. The visual language uses an original architectural threshold, directed light, obsidian, parchment, bronze, and restrained clay accents.

## Run and verify

Use Node.js 22.12+; the environment and deployment use Node 24.

```sh
npm ci
npm run dev
npm test
npm run build -- --base=/portfolio/
```

No backend, API key, external font request, analytics, or database is required. The GitHub Pages workflow runs tests and builds with its configured base path before deployment. The public site is https://thanishsarah.github.io/portfolio/.

## Page architecture

- `src/Portfolio.jsx`: navigation, field selection, search routing, exploration state, motion preference, and the optional game room.
- `src/PortfolioSections.jsx`: current AI workstreams, professional record, architecture disclosure, and leadership/advisory contact.
- `src/WorkGallery.jsx`: all four public work accounts with native detail dialogs, Escape, focus restoration, and meaningful professional context.
- `src/KnowledgeIndex.jsx`: ten searchable public curriculum overviews and international perspectives, with native keyboard tabs and a selected overview.
- `src/ThresholdArt.jsx`: original procedural SVG architecture, bounded pointer response, and visibility-aware atmosphere. No video or image source is embedded.
- `src/AncientGame.jsx` and `src/ur-game.js`: game interface and pure, deterministic Royal Game of Ur interpretation.
- `src/portfolio.css`: explicit display, body, utility, and responsive typography roles. Feature styles are beside their components.

Instrument Serif regular and true italic are used for display headings. Manrope serves body copy and controls. Both are pinned and self-hosted; licenses are in `public/licenses/`. The primary display font is preloaded. Portalled search and native dialogs use the same type system. There are no Indic fonts in the current website.

Three field controls change the architectural inlay and highlight a relevant work account. Ctrl/Cmd+K searches approved public content. Case exploration can inform an optional conversation brief. Drafts and game state remain in page memory; the only persistent local setting is the motion preference. Copy and email actions are explicit. There is no send endpoint.

## The game room

The optional game is loaded as a separate code chunk on first opening. A quick race uses three pieces per side; a full match uses seven. The player and the rule-based Archivist follow the same fourteen-step route through twenty physical squares. Four binary casting stones produce totals 0–4 with weights 1, 4, 6, 4, 1 out of 16. Matching private courts connect to an eight-square shared road.

Own pieces cannot share a square. A shared-road capture returns the rival to its start; the central rosette is protected. Rosettes grant another cast, and an exact cast is required to finish. A zero or blocked cast passes the turn. The opponent weighs progress, capture, exact exits, extra casts, and weighted capture risk; it is an inspectable heuristic, not a generative-AI service.

The model keeps casting reproducible from a seed and returns immutable state. Tests cover route geometry, binary casting, entry/blocking, exact exit, captures, rosette safety, extra casts, frozen inputs, legal opponent choices, and complete races for both match lengths. The browser interface pauses computer timers while the dialog is closed or the page is hidden. No match is uploaded or persisted. Rules are explicitly a modern playable interpretation; the British Museum board is linked for historical context.

## Professional content and confidentiality

Career facts live in `src/content.js`, `src/case-studies.js`, and `src/ai-practice.js`. The formal current title remains Digital Media & Information Literacy Expert / Curriculum Manager. AI integration is an ongoing remit; the seven-school scope refers to curriculum. IB experience is qualified as aligned school communication and framework contribution, not IB employment or certification. MetFilm metrics remain in their exact corporate-sponsored enrolment and partnership context.

`src/curriculum.js` and `src/international.js` contain newly written, high-level public summaries only. Original lesson plans, institutional documents, spreadsheets, internal links, source images, exercises, sequences, rubrics, and the private reference video are excluded. Updated résumé files also stay outside this checkout; the website does not publish the private phone number.

The architecture disclosure uses original interpretive drawings with named references: Chand Baori, Sanchi, and Indra’s net as a Huayan Buddhist philosophical image. These inform contemporary design choices and are not historical reconstructions, scientific claims, or professional credentials.

Keep confidential originals and extracted text outside the repository. The Vite guard scans source/public assets and generated output for documents, embedded documents, private references, and symlinks. Browser content can be captured; confidentiality is provided by excluding originals, not by blocking selection or hiding download controls.

## Accessibility and motion

Navigation, work accounts, knowledge tabs, public search, and game controls support keyboard use. Native dialogs close with Escape and restore focus. The mobile navigation also supports Escape. Motion follows system preferences, the footer control, and page visibility. The architectural drawing stops decorative motion offscreen. Game state remains intact when the room closes, and the computer resumes only when the room is active.

## Cloud environment

Use the existing isolated `/workspace/portfolio` checkout. Dependency installation is `npm ci`; no extra checkout or service is needed. Built files and dependencies may persist in snapshots, while a development server must be started in each new runtime. Production is deployed by `.github/workflows/deploy.yml` on pushes to main.
