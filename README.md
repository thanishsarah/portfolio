# Vinayak Thanish — Portfolio

A leadership-first React portfolio positioning Vinayak Thanish around AI integration for education, content, communications, and brand systems. It gives India and international conversations equal visibility, with a separate advisory enquiry route. The current AI integration remit is explicitly ongoing; completed rollout, ROI, executive titles, and formal IB credentials are not inferred from the supplied materials.

## Experience and interactions

The portfolio connects a visitor’s challenge, relevant experience, a playable connection puzzle, and a contextual conversation. The three practice lenses in `src/practice-model.js` share state with the case explorer and conversation brief. Case narratives distinguish current remit, experience, personal responsibility, working approach, and public organisational context.

`src/ConnectionGame.jsx` is a playable path puzzle within the original editorial page. Three deterministic arrangements begin as seeded spanning trees, pruned to paths from a fixed source to three destinations. Visitors rotate path tiles; breadth-first graph traversal powers reciprocal connections after every turn. Guided turns converge to a constructed solution. Undo, reset, next arrangement, a keyboard grid, and live status make the game usable without time pressure. The pure model in `src/connection-game.js` owns generation, traversal, rotation, and hints. All portfolio cases remain available independently of game progress. This is an original portfolio interaction, not an AI service.

Explored cases and the visitor’s optional challenge remain in page memory. The contact area previews the complete conversation brief before an explicit copy or email action. Reset clears the route and draft; reloading does not preserve them. No analytics, tracking, external font request, database, or API key is required. A persistent motion preference is the only local-storage setting.

The curriculum and international overviews are supporting disclosures, with direct fragment links that reveal the relevant section. Curriculum search, filters, and native overview dialogs remain keyboard accessible. Formal résumé titles and qualifications remain intact.

The VT Continuum mark, original project illustrations, and parametric ribbon sculpture share the forest, sandstone, patinated bronze, and terracotta palette. Source vectors live in `public/` and `src/ProjectArtwork.jsx`. Yatra One adds Indic calligraphic display lettering; Manrope provides clear body text. Both fonts are pinned and self-hosted through Fontsource, with OFL licenses in `public/licenses/`. Motion follows system preferences and the footer control. The sculpture uses deterministic geometry and bounded pointer tilt without a render loop. Ctrl/Cmd+K opens a keyboard-accessible search of approved public content; topic selection reveals and filters the supporting index.

`src/ArchitectureNotes.jsx` contains original interpretive diagrams with named references: Chand Baori’s stepped geometry, Sanchi’s circular circulation, and Indra’s net as a Huayan Buddhist philosophical image. These are design references, not historical reconstructions or professional credentials. Architectural line tracing and live puzzle paths respect reduced motion. The core layout and professional narrative retain the previous editorial direction.

## Develop

Use Node.js 22.12+ (Node 24 is available in this environment).

```sh
npm ci
npm run dev
```

The development server uses port 5173 by default. No API keys, database, or backend service is required.

## Content and presentation

- `src/content.js`: personal details, professional record, and education.
- `src/case-studies.js`: public case narratives and evidence boundaries.
- `src/practice-model.js`: shared challenge lenses and conversation-brief composition.
- `src/ai-practice.js`: current AI remit and workstreams.
- `src/curriculum.js` and `src/international.js`: public educational overviews.
- `src/ConnectionGame.jsx` and `src/connection-game.js`: playable network puzzle and deterministic model.
- `src/ArchitectureNotes.jsx`: sourced architecture and philosophical design references.
- `src/portfolio-search.js`: the public search index and ranking.
- `src/signal-geometry.js`: parametric sculpture geometry.
- `src/experience.css` and `src/heritage.css`: global design rules, typography, and shell; feature styles live beside their components.

Update the description and theme color in `index.html` as needed. Personal source documents, phone number, date of birth, and confidential originals are excluded from the website.

## Confidential curriculum work

The curriculum showcase publishes only newly written, high-level overviews in `src/curriculum.js`. Visitors can filter topics, read public overviews, and contact Vinayak to discuss access. The original curriculum documents, spreadsheet contents, lesson sequences, exercises, rubrics, internal links, and page images are not included in the site or repository. Grade labels are used only where the overview can be stated confidently.

The separate international curriculum section uses reviewed public descriptions in `src/international.js`. It describes IB-aligned curriculum communication, international learning frameworks, and future-skills connections without asserting employment by the IB organisation, certification, or institutional authorisation. Updated résumé files and source documents stay outside the website and repository.

Keep confidential originals and any extracted text outside this checkout. Do not place them in `public/`, import them into application code, or put them in repository history. `.gitignore` excludes common source-document types, and the Vite build guard checks source/public assets and the actual generated output for disallowed documents, embedded documents, private file references, and symlinks. This is an accidental-publication safeguard; newly written public summaries still require content review.

Run the confidentiality checks with:

```sh
npm test
npm run build
```

Public browser content can be copied or captured. Removing download buttons, blocking selection, and hiding links do not provide confidentiality. This site therefore exposes no original-document viewer or original-file endpoint. Any future authenticated previews would require separate server-side authorization and would still permit screenshots by viewers.

## Production

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static hosting provider. This portfolio is published through GitHub Pages at https://thanishsarah.github.io/portfolio/; new changes appear after a successful deployment run.

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy.yml` installs dependencies with `npm ci`, builds the site using the Pages base path, and deploys `dist/`. Once committed and pushed, it runs on pushes to `main` and can also be started manually from the repository’s Actions tab.

In the GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions**. Push the website and workflow to `main`, then check the deployment result in Actions. The expected address after a successful deployment is [https://thanishsarah.github.io/portfolio/](https://thanishsarah.github.io/portfolio/). Adding the workflow alone does not publish the site.

To reproduce the project’s Pages asset paths locally:

```sh
npm run build -- --base=/portfolio/
```

The workflow reads the base path from GitHub Pages so its build can also accommodate a configured custom domain.

## Cloud tasks

Use the existing `/workspace/portfolio` checkout. Each task is already isolated, so no additional Git worktree is needed. Dependencies and built files can persist in an environment snapshot, but the development server must be started in each new runtime.
