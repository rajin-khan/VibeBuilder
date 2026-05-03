# Blockloom Deployment Guide

Blockloom is a Vite React single-page app. The repository builds static frontend files into `build/`; SELISE Blocks provides IAM, Data Gateway, and Storage/Media.

## Best Deployment Choice

For this assignment, deploy on **SELISE Blocks Cloud** if possible. The project brief is specifically about using SELISE Blocks, the remote repository is already connected to Blocks Cloud, and the app depends on SELISE services for identity, data, and media.

Vercel is a valid fallback for the static frontend, but it is less ideal for submission because the grader may expect the SELISE-hosted URL and Blocks deployment flow.

## Local Verification Before Deploy

```bash
npm install
npm run lint
npm run build
npm test -- --run
```

The production build output is `build/`.

## Required Environment Values

Vite reads `VITE_*` values at build time. Keep `.env.production` aligned with the SELISE project environment.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | SELISE Blocks API base URL |
| `VITE_X_BLOCKS_KEY` | Public frontend project key |
| `VITE_PROJECT_SLUG` | Data Gateway project slug |
| `VITE_CAPTCHA_SITE_KEY` | Optional captcha site key |
| `VITE_CAPTCHA_TYPE` | Optional captcha provider |
| `VITE_VIBE_PUBLIC_READ_TOKEN` | Optional anonymous read fallback; prefer public View access instead |

Do not add private secrets to `VITE_*` variables. They are bundled into browser JavaScript.

## Deploy On SELISE Blocks Cloud

1. Push the final code to `main`.
2. Open [SELISE Blocks Cloud](https://cloud.seliseblocks.com).
3. Open the project connected to `rajin-khan/VibeBuilder`.
4. Go to **Deployment**.
5. Open the repository card.
6. Choose **Deploy Now** for the `main` branch, or enable Git-based deployment if it is available.
7. Wait for the deployment job to finish.
8. Open the **Deploys To** URL from the deployment overview.
9. Test `/login`, `/app`, and at least one `/site/...` public route.

If the deployment panel asks for build settings:

| Setting | Value |
| --- | --- |
| Install command | `npm ci` or `npm install` |
| Build command | `npm run build` |
| Output directory | `build` |
| Node version | Node 20+ or Node 24 |

## Data Gateway Schemas

Blockloom uses these Data Gateway entities:

| Entity | Read query | Insert mutation |
| --- | --- | --- |
| `VibeWebsite` | `getVibeWebsites(input: DynamicQueryInput)` | `insertVibeWebsite` |
| `VibePage` | `getVibePages(input: DynamicQueryInput)` | `insertVibePage` |
| `VibeAsset` | `getVibeAssets(input: DynamicQueryInput)` | `insertVibeAsset` |

Entity fields:

| Entity | Fields |
| --- | --- |
| `VibeWebsite` | `ItemId`, `OwnerId`, `Slug`, `Payload`, `CreatedDate`, `LastUpdatedDate`, optional `IsDeleted` |
| `VibePage` | `ItemId`, `WebsiteId`, `OwnerId`, `Slug`, `Payload`, `CreatedDate`, `LastUpdatedDate`, optional `IsDeleted` |
| `VibeAsset` | `ItemId`, `OwnerId`, `WebsiteId`, `FileName`, `Payload`, `CreatedDate`, optional `IsDeleted` |

After editing schemas, click **Publish** in Data Gateway.

## Public Site Access

Published pages are rendered at:

```text
/site/:siteSlug/:pageSlug
```

For anonymous visitors, set **View** access to **Public** for:

- `VibeWebsite`
- `VibePage`

`VibeAsset` metadata can stay restricted because published layouts store direct image URLs.

## SPA Routing

Deep links such as `/app/...` and `/site/...` must fall back to `index.html`. The included `nginx.conf` and `staticwebapp.config.json` show the required behavior.

## Optional Vercel Deployment

Vercel can deploy this as a static Vite app:

1. Import the GitHub repository into Vercel.
2. Set build command to `npm run build`.
3. Set output directory to `build`.
4. Add the same `VITE_*` environment values.
5. Deploy.
6. Add the Vercel origin to SELISE IAM/CORS settings if login or API calls reject the host.

This should not conflict with the SELISE-connected GitHub repo. A repository can be connected to both SELISE Blocks Cloud and Vercel. The main risk is deploying a commit to one platform and forgetting to deploy the same commit to the other.
