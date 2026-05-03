# Blockloom — deployment & operations

Blockloom builds a **static Vite SPA** into `build/`. Identity, structured content, and media are served by your **Blocks project** APIs (see `.env.example` for the variables the client expects).

## Recommended hosting

Deploy from the **Blocks Cloud** project linked to this repository when you need IAM, Data Gateway, and storage to match production keys. The flow in this guide assumes that environment.

You can also host the `build/` folder on any static host (e.g. Vercel); set the same `VITE_*` values and add the new origin to your identity/CORS allow list if sign-in or API calls fail.

## Local Verification Before Deploy

```bash
npm install
npm run lint
npm run build
npm test -- --run
```

The production build output is `build/`.

## Required Environment Values

Vite reads `VITE_*` values at build time. Keep `.env.production` aligned with your Blocks project environment.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API base URL for your tenant |
| `VITE_X_BLOCKS_KEY` | Public frontend project key |
| `VITE_PROJECT_SLUG` | Data Gateway project slug |
| `VITE_CAPTCHA_SITE_KEY` | Optional captcha site key |
| `VITE_CAPTCHA_TYPE` | Optional captcha provider |
| `VITE_VIBE_PUBLIC_READ_TOKEN` | Optional anonymous read fallback; prefer public View access instead |

Do not add private secrets to `VITE_*` variables. They are bundled into browser JavaScript.

## Deploy on Blocks Cloud

1. Push the final code to `main`.
2. Open [Blocks Cloud](https://cloud.seliseblocks.com) (operator console).
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
6. Add the Vercel origin to your IAM/CORS allow list if login or API calls reject the host.

The same GitHub repo can be wired to Blocks Cloud and Vercel; keep commit SHAs in sync across hosts if you use both.
