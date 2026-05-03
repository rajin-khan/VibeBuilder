# Blockloom Deployment Guide

<p align="center">
  <img src="public/favicon.png" alt="Blockloom app icon" width="64" height="64" />
</p>

Blockloom builds a static Vite single-page app into `build/`. Identity, structured content, and media are handled by the connected SELISE Blocks project.

## Recommended Host

Use **SELISE Blocks Cloud** for the academic submission because the project brief is centered on SELISE Blocks and the repository is already connected there.

Vercel can also host the static frontend, but you must add the Vercel origin to IAM/CORS allow lists if sign-in or API calls reject the host.

## Pre-Deployment Checks

```bash
npm install
npm run lint
npm run build
npm test -- --run
```

Production output: `build/`.

## Environment Variables

Vite reads `VITE_*` values at build time.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | SELISE Blocks API base URL. |
| `VITE_BLOCKS_API_URL` | Blocks API URL used by generated services. |
| `VITE_X_BLOCKS_KEY` | Public frontend project key. |
| `VITE_PROJECT_SLUG` | Data Gateway project slug. |
| `VITE_CAPTCHA_SITE_KEY` | Optional captcha site key. |
| `VITE_CAPTCHA_TYPE` | Optional captcha provider. |
| `VITE_VIBE_PUBLIC_READ_TOKEN` | Optional anonymous read fallback; prefer public view access. |

Do not put private secrets in `VITE_*` variables. They are bundled into browser JavaScript.

## Deploy On SELISE Blocks Cloud

1. Push the final code to `main`.
2. Open [Blocks Cloud](https://cloud.seliseblocks.com).
3. Open the project connected to `rajin-khan/VibeBuilder`.
4. Go to **Deployment**.
5. Open the repository card.
6. Deploy the `main` branch.
7. Wait for the deployment job to complete.
8. Open the deployment URL.
9. Test `/login`, `/app`, and a published `/site/...` route.

If build settings are requested:

| Setting | Value |
| --- | --- |
| Install command | `npm ci` or `npm install` |
| Build command | `npm run build` |
| Output directory | `build` |
| Node version | Node 20+ or Node 24 |

## Data Gateway Entities

Blockloom expects these entities:

| Entity | List query | Insert mutation |
| --- | --- | --- |
| `VibeWebsite` | `getVibeWebsites(input: DynamicQueryInput)` | `insertVibeWebsite` |
| `VibePage` | `getVibePages(input: DynamicQueryInput)` | `insertVibePage` |
| `VibeAsset` | `getVibeAssets(input: DynamicQueryInput)` | `insertVibeAsset` |

For anonymous public pages, set **View** access to **Public** for `VibeWebsite` and `VibePage`, or provide a carefully scoped public read token.

## Public Routes

Published pages render at:

```text
/site/:siteSlug/:pageSlug
```

The host must fall back unknown routes to `index.html` so direct links and refreshes work for `/app/...` and `/site/...`.

## Academic References

- [`academic/submission.md`](academic/submission.md)
- [`academic/installation.md`](academic/installation.md)
- [`academic/progress-report.md`](academic/progress-report.md)
