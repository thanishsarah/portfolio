# Vinayak Thanish — Portfolio

A responsive React portfolio focused on education, curriculum development, educator training, and digital media literacy. Content is drawn from the supplied résumé. Its “living curriculum” design combines deep forest, chartreuse, and warm paper tones, original diagrams, and a custom VT identity.

## Brand and interactions

The **VT Pathway** mark connects an open V with a shared T canopy; a detached seed suggests the next connection. The reusable component is `src/BrandMark.jsx`, the transparent vector asset is `public/brand-mark.svg`, and `public/favicon.svg` provides the matching site icon.

The interactive learning map offers Curriculum, AI literacy, and Strategy lenses, each opening its corresponding initiative. Project filters and native modal dialogs provide keyboard access and focus restoration. Experience entries expand individually. Email can be opened or copied.

Motion has a persistent on/off control, follows the system’s reduced-motion preference, and pauses when the document is hidden. Pointer responses use animation frames and update CSS without re-rendering the page. All initiative illustrations are original SVGs labeled as illustrations; they are not screenshots of delivered products. No animation library, tracking, external font request, or additional runtime dependency is required.

## Develop

Use Node.js 22.12+ (Node 24 is available in this environment).

```sh
npm ci
npm run dev
```

The development server uses port 5173 by default. No API keys, database, or backend service is required.

## Make it yours

Edit `src/content.js` to update your name, role, introduction, biography, interests, contact email, social links, initiatives, experience, and education. A project’s optional `url` enables a link in its detail dialog. Contact links appear when an email address is supplied; social links appear when supplied. No project or social URLs were inferred from the résumé. The original résumé PDF, phone number, and date of birth are not included in the website.

Update the description and theme color in `index.html` as needed. Styling lives in `src/styles.css`; the original decorative project illustrations live in `src/ProjectArtwork.jsx`.

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

Deploy the generated `dist/` directory to a static hosting provider. The site has not been published or connected to a domain.

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
