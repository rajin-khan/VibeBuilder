# Blockloom

![Blockloom editor](docs/assets/blockloom-editor-hero-browser.png)

**Blockloom** is a calm, fast **drag-and-drop website builder**: one workspace to draft sites, tune blocks, ship media, and publish a live site your visitors can actually open—without writing page code by hand.

Shipped for **CSE226** as a capstone on the Blocks stack (IAM, Data Gateway, storage).  
**Author:** [Rajin Khan](https://github.com/rajin-khan) · **`@rajin-khan`**

> Human-readable progress write-up: [`docs/PROGRESS_REPORT.md`](docs/PROGRESS_REPORT.md) (screenshots included).  
> Optional LLM-oriented notes for collaborators: [`llm-docs/README.md`](llm-docs/README.md)

## What It Does

- **Workspace dashboard** for creating sites, choosing starter templates, and reopening drafts.
- **Drag-and-drop editor** with a compact studio sidebar, block palette, floating layers panel, responsive preview controls, zoom, undo/redo, save, and publish actions.
- **57 editable block types** covering hero sections, headings, text, media, galleries, pricing, testimonials, forms, navigation, layout shells, social proof, and utilities.
- **Per-block customization** across content, style, and advanced settings.
- **Site settings** for global colors, typography, SEO, favicon, OG image, homepage, radius, and attribution.
- **Published site renderer** at `/site/:siteSlug/:pageSlug` using the same component registry as the editor, but without builder UI.
- **SELISE Blocks integration** for IAM, Data Gateway persistence, and media/storage, with a local demo fallback for development.

## Screenshots

| Login | Signup |
| --- | --- |
| ![Blockloom login](docs/assets/blockloom-login-clean.png) | ![Blockloom signup](docs/assets/blockloom-signup.png) |

| Workspace | Editor palette |
| --- | --- |
| ![Blockloom workspace](docs/assets/blockloom-workspace-browser.png) | ![Blockloom editor](docs/assets/blockloom-editor-browser.png) |

| Editing a hero block |
| --- |
| ![Blockloom hero editor](docs/assets/blockloom-editor-hero-browser.png) |

| Published site |
| --- |
| ![Blockloom public site](docs/assets/blockloom-public-viewport.png) |

## Tech Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS
- Radix UI primitives and icons
- `@dnd-kit` for drag/drop
- TanStack Query
- SELISE Blocks IAM, Data Gateway, and Storage/Media services
- Vitest + Testing Library

## Requirements

- Node.js 24 LTS preferred for this project pass. Node 20+ should also work.
- npm
- Access to the connected SELISE Blocks project if you want real IAM/Data Gateway persistence.

## Local Setup

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login).

For a quick local-only test, use **Continue in demo workspace**. Demo data stays in the browser on that device. For real persistence, use a SELISE IAM account with the project environment configured.

## Environment

Use `.env.example` as the local template. Production values are read from `.env.production` by Vite during `npm run build:prod`.

Important variables:

```env
VITE_API_BASE_URL=https://api.seliseblocks.com
VITE_X_BLOCKS_KEY=...
VITE_PROJECT_SLUG=pemfes
VITE_CAPTCHA_SITE_KEY=
VITE_CAPTCHA_TYPE=
```

`VITE_X_BLOCKS_KEY` is sent from the browser as a public project key, matching the SELISE Blocks frontend model. Do not place private secrets in any `VITE_*` variable.

## Quality Checks

```bash
npm run lint
npm run build
npm test -- --run
```

Latest full run before submission:

- `npm run lint` passed
- `npm run build` passed
- `npm test -- --run` passed with 682 tests, 2 skipped, and 1 todo

## Deployment

The app is frontend-only in the sense that this repository builds a static Vite SPA. The durable backend services are SELISE Blocks services: IAM, Data Gateway, and Storage/Media.

Recommended deployment for the assignment is **SELISE Blocks Cloud**, because the brief is specifically about SELISE Blocks and the repository is already connected there. Vercel can host the static frontend too, but SELISE hosting best matches the project context and avoids having to explain why the final solution is hosted elsewhere.

See [DEPLOYMENT.md](DEPLOYMENT.md) for exact steps.

## Submission package

Included in this repo for graders:

- **Source code** (this tree)
- **Install & deploy:** this README + [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Progress report (Markdown):** [`docs/PROGRESS_REPORT.md`](docs/PROGRESS_REPORT.md) with `docs/assets/` screenshots

**Video demo** and **full chat / vibe-coding history** are supplied separately in the course zip, per Canvas instructions.

## Credit

Built by [Rajin Khan](https://github.com/rajin-khan) for CSE226 Section 1, Spring 2026.
