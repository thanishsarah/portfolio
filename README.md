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
