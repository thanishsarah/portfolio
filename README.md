# Vinayak Thanish — Portfolio

A leadership-first React portfolio positioning Vinayak Thanish around AI integration for education, content, communications, and brand systems. It gives India and international conversations equal visibility, with a separate advisory enquiry route. The current AI integration remit is explicitly ongoing; completed rollout, ROI, executive titles, and formal IB credentials are not inferred from the supplied materials.

## Experience and interactions

The portfolio connects a visitor’s challenge, relevant experience, an inspectable editorial decision, and a contextual conversation. The three practice lenses in `src/practice-model.js` share state with the case explorer and conversation brief. Case narratives distinguish current remit, experience, personal responsibility, working approach, and public organisational context.

`src/DecisionStudio.jsx` is an original fictional communication review. Its three editorial choices change the draft and its hold state; the final state still requires human review. It uses fixed illustrative material, has no AI service or publication endpoint, and does not represent a delivered institutional workflow.

Explored cases and the visitor’s optional challenge remain in page memory. The contact area previews the complete conversation brief before an explicit copy or email action. Reset clears the route and draft; reloading does not preserve them. No analytics, tracking, external font request, database, or API key is required. A persistent motion preference is the only local-storage setting.

The curriculum and international overviews are supporting disclosures, with direct fragment links that reveal the relevant section. Curriculum search, filters, and native overview dialogs remain keyboard accessible. Formal résumé titles and qualifications remain intact.

The VT Pathway mark, original project illustrations, and measured geometric field share the charcoal, warm stone, bronze, and mineral-green palette. Source vectors live in `public/` and `src/ProjectArtwork.jsx`. Manrope is self-hosted through Fontsource; its OFL license is in `public/licenses/manrope.txt`. Motion follows system preferences and the footer control.

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
- `src/decision-studio.js`: the original fictional review example.
- `src/experience.css`: global design rules and shell; feature styles live beside their components.

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
