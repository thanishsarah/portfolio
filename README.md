# Vinayak Thanish — The Signal Atlas

A playable orbital portfolio built with React, Vite, and a procedural Canvas renderer. Fly a probe, stabilise at three relays, recover their signals, and return to the observatory. Each relay connects to Vinayak’s real work in learning, communication, and AI integration. The portfolio archive is always available; gameplay does not gate the professional record.

## Play

- WASD or arrow keys: thrust in world directions.
- Space: brake. E: hold to scan a nearby relay. Q: cycle the target.
- P / Escape: pause or resume. R: recover after capture.
- Touch: flight stick plus hold-to-brake and hold-to-scan controls.
- Guided flight: route planning, stabilisation, scanning, and return. Manual thrust or braking immediately takes control back.
- Sector map / follow view, optional procedural sound, reduced effects, flight guide, and engineering inspection are available from the control rail.

Scanning requires proximity, speed below 55 game units per second, and a continuous 1.5-second hold. The central horizon captures the probe. Recovery keeps discoveries and returns to a safe checkpoint with a score penalty. All three signals and a slow observatory return complete the expedition.

## Simulation and rendering

`src/game/simulation.js` is a pure deterministic model. It applies softened inverse-square gravity, normalised thrust, bounded speed, damping, braking, and boundary reflection. The controller advances physics at a fixed 1/120-second step, caps accumulated frame gaps, and separates simulation time from visual time. This is a stylised Newtonian game; the disc and lensing arcs are artistic interpretations.

Guided flight builds a visibility graph around an exclusion circle, uses Dijkstra’s algorithm to find safe waypoints, and follows them with bounded steering and gravity compensation. Coast prediction uses the same gravity model. Tests cover deterministic replay, pause, control normalisation, scan gates, capture/recovery, save validation, route clearance, and a complete guided mission.

`src/game/render-scene.js` owns cached procedural nebulae, stars, a luminous black-hole sprite, station glyphs, routes, trajectories, and ship effects. It does not mutate game state or run its own animation loop. Backing buffers and pixel density are bounded. Physics and rendering pause when the tab loses focus or the archive/guide opens. Reduced effects follow the system preference and the player’s control.

`src/game/use-game.js` owns input, the fixed-step loop, camera, progress saves, optional audio, lifecycle cleanup, and local frame samples. Held inputs clear on blur, pointer cancellation, modal entry, and phase changes. Browser modifier shortcuts are not intercepted; repeated pause keys do not toggle repeatedly.

## Public archive and identity

The archive contains current AI scope, four work accounts, ten searchable public curriculum overviews, international perspectives, formal roles, education, and an explicit email enquiry route. It distinguishes ongoing AI integration from curriculum implementation across seven schools. IB-aligned communication does not imply IB employment or certification. The fictional game does not add astronaut, astrophysics, or game-development employment credentials.

The VT Orbit mark, space palette, and original graphics form the visual identity. Source vector assets are in `public/`; the mark component is `src/BrandMark.jsx`. Manrope is self-hosted through Fontsource, with its OFL license in `public/licenses/manrope.txt`. No external images, animation library, inference service, API key, tracking, or backend is required.

## Privacy and confidential work

Only newly written public summaries are included. Original curriculum documents, spreadsheet contents, lesson sequences, internal links, source images, and the private creative reference are excluded. The revised résumé files are delivered separately outside this public checkout.

Versioned flight progress is saved on the current device under `vt-signal-atlas-v1`. It contains recovered relay IDs, checkpoint, time, target, and recovery count. The motion preference uses `vt-motion`. A new expedition clears the saved flight. The optional contact draft remains in memory and enters an encoded email link only for an explicit user action. It is not included in game saves.

`.gitignore` excludes source-document formats. The Vite build guard scans source/public assets and actual generated output for disallowed documents, embedded documents, private paths, and symlinks. Public summaries still require factual review.

## Develop and verify

Use Node.js 22.12+; Node 24 is available in the cloud environment.

```sh
npm ci
npm test
npm run build
npm run dev
```

The development server defaults to port 5173. No database or credentials are needed for the application. Use the existing checkout; do not create a worktree for setup unless requested.

## Content

- `src/content.js`: personal details, formal experience, education.
- `src/case-studies.js`: grounded public accounts and evidence boundaries.
- `src/ai-practice.js`: current AI remit and workstreams.
- `src/curriculum.js`, `src/international.js`: approved public overviews.
- `src/game/simulation.js`: world, mission mechanics, and navigation.
- `src/game/SpacePortfolio.jsx`: game interface and accessible HTML controls.
- `src/game/PortfolioArchive.jsx`: public professional archive.

Update metadata in `index.html` when the identity or public URL changes.

## Publish

The existing `.github/workflows/deploy.yml` installs locked dependencies, runs tests, builds with the configured Pages base, checks public assets, and deploys `dist/` after pushes to `main`. Manual project-path builds use:

```sh
npm run build -- --base=/portfolio/
npm run preview -- --base=/portfolio/
```

Validate the generated site and deployment result; an open process or port alone does not demonstrate a working game.
