<p align="center">
  <img src="public/favicon.svg" alt="Blockloom" width="72" height="72" />
</p>

<h1 align="center">Blockloom</h1>

<p align="center"><strong>Design it. Shape it. Publish it.</strong></p>

<p align="center">
  <a href="https://github.com/rajin-khan">@rajin-khan</a>
  ·
  <a href="https://github.com/rajin-khan/VibeBuilder">GitHub</a>
</p>

---

<p align="center">
  <img src="public/og-card.svg" alt="Blockloom — studio-grade site builder" width="920" />
</p>

**Blockloom** is a studio-grade **visual website builder**: drag blocks onto the canvas, tune copy and styles in real time, manage media, and ship a **published** site your visitors can browse—no template soup, no hand-written page markup.

| | |
| --- | --- |
| **Workspace** | Create sites from starters, manage pages, drafts, and publish flow in one place. |
| **Editor** | 57+ block types, layers, responsive preview, zoom, undo/redo, autosave, publish. |
| **Live sites** | Public routes at `/site/:siteSlug/:pageSlug`—same blocks as the editor, zero builder chrome. |
| **Site settings** | Global theme, typography, SEO, social preview, favicon, homepage, and attribution. |

<p align="center">
  <img src="docs/assets/blockloom-editor-hero-browser.png" alt="Blockloom editor" width="780" />
</p>

## Stack

React 19 · Vite · TypeScript · Tailwind CSS · Radix UI · `@dnd-kit` · TanStack Query · Vitest

## Run it locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login). Use **Continue in demo workspace** for a quick, offline-friendly tryout (data stays in your browser). Sign in when you want synced projects.

**Hosting and production configuration:** [`DEPLOYMENT.md`](DEPLOYMENT.md)

## Quality

```bash
npm run lint
npm run build
npm test -- --run
```

## Documentation

| Doc | Purpose |
| --- | --- |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Build output, hosting, env, and gateway notes |
| [`submission.md`](submission.md) | Course submission index (read first for graders) |
| [`installation.md`](installation.md) | Detailed install & local vs deployed testing |
| [`docs/PROGRESS_REPORT.md`](docs/PROGRESS_REPORT.md) | Deliverable summary, requirements mapping, visuals |
| [`llm-docs/README.md`](llm-docs/README.md) | Contributor-oriented agent / recipe docs |

---

<p align="center">
  <sub>Built by <a href="https://github.com/rajin-khan"><strong>Rajin Khan</strong></a> · MIT License</sub>
</p>
