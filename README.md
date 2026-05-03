<p align="center">
  <img src="public/favicon.png" alt="Blockloom app icon" width="92" height="92" />
</p>

<h1 align="center">Blockloom</h1>

<p align="center">
  <strong>Design it. Shape it. Publish it.</strong><br />
  A polished visual website builder built for the CSE226 Selise Blocks Project.
</p>

<p align="center">
  <a href="https://pemfes-dzdfz.seliseblocks.com">Live app</a>
  ·
  <a href="academic/submission.md">Academic submission</a>
  ·
  <a href="https://github.com/rajin-khan">Rajin Khan</a>
</p>

<p align="center">
  <img src="public/og-card.svg" alt="Blockloom social preview" width="940" />
</p>

## Overview

**Blockloom** is a studio-grade drag-and-drop website builder. Users can create sites, manage pages, add reusable blocks, edit content and styling visually, autosave drafts, publish live pages, and view public sites without editor chrome.

It is a frontend React/Vite application backed by SELISE Blocks services for identity, structured data, and media storage. For local exploration, it also includes a demo workspace that stores data in the browser.

<p align="center">
  <img src="academic/assets/blockloom-editor-hero-browser.png" alt="Blockloom editor showing a selected hero block" width="860" />
</p>

## Highlights

| Area | What Blockloom provides |
| --- | --- |
| Workspace | Create sites, open drafts, choose starter templates, and jump to live URLs. |
| Editor | 57+ block types, compact sidebar, floating layers, inspector tabs, drag/drop, zoom, undo/redo, save, and publish. |
| Customization | Content, style, spacing, color, layout, media, responsive visibility, SEO, favicon, and global site settings. |
| Publishing | Draft-vs-published separation with clean public routes at `/site/:siteSlug/:pageSlug`. |
| Persistence | SELISE IAM, Data Gateway schemas, Storage/Media integration, plus local demo fallback. |

## Screenshots

| Login | Workspace |
| --- | --- |
| ![Blockloom login](academic/assets/blockloom-login-clean.png) | ![Blockloom workspace](academic/assets/blockloom-workspace-browser.png) |

| Editor | Published site |
| --- | --- |
| ![Blockloom editor](academic/assets/blockloom-editor-browser.png) | ![Blockloom published site](academic/assets/blockloom-public-viewport.png) |

## Tech Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS
- Radix UI primitives and icons
- `@dnd-kit` for drag-and-drop
- TanStack Query
- SELISE Blocks IAM, Data Gateway, and Storage/Media APIs
- Vitest + Testing Library

## Quick Start

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login).

Use **Continue in demo workspace** for a fast local walkthrough. Use the deployed app for the full IAM-backed experience.

## Quality Checks

```bash
npm run lint
npm run build
npm test -- --run
```

## Documentation

| Document | Purpose |
| --- | --- |
| [academic/submission.md](academic/submission.md) | Course submission index and grading guide. |
| [academic/installation.md](academic/installation.md) | Detailed installation, local testing, and deployment notes. |
| [academic/progress-report.md](academic/progress-report.md) | Formal academic progress report with screenshots and requirement mapping. |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Hosting, environment variables, schema notes, and deployment workflow. |
| [academic/VIDEO_LINK.txt](academic/VIDEO_LINK.txt) | Plain-text demo video link. |
| [chat-logs/codex-side.md](chat-logs/codex-side.md) | Codex interaction history for submission. |
| [chat-logs/cursor-side.md](chat-logs/cursor-side.md) | Cursor interaction history for submission. |

## Author

Built by [Rajin Khan](https://github.com/rajin-khan) (`@rajin-khan`) for CSE226 Section 1, Spring 2026.

## License

Blockloom is released under the [MIT License](LICENSE).
