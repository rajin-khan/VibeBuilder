# Blockloom Installation Guide

<p align="center">
  <img src="../public/favicon.svg" alt="Blockloom app icon" width="64" height="64" />
</p>

This guide explains how to run **Blockloom** locally, how to verify it, and where to test the full deployed experience.

## Requirements

- Node.js 20+; Node 24 LTS is recommended.
- npm.
- A modern browser.

## Install

From the repository root:

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login).

### Recommended Local Path

Use **Continue in demo workspace** on the login page. It gives you a complete editor walkthrough without requiring cloud auth. Demo data stays in browser `localStorage`.

### Full IAM Path

Real sign-in on localhost requires:

- A valid `.env` copied from `.env.example`.
- Correct `VITE_*` values for the connected SELISE project.
- IAM/CORS origin settings that allow your local dev URL.

If any of that is not configured, test real login and persistence on the deployed app instead.

## Build

```bash
npm run build
```

The static production output is written to `build/`.

## Quality Checks

```bash
npm run lint
npm run build
npm test -- --run
```

## Where To Test

| Goal | Recommended target |
| --- | --- |
| Fast local editor walkthrough | Local demo workspace |
| Real signup/sign-in | Deployed app |
| Cloud persistence | Deployed app |
| Publish and public `/site/...` routes | Deployed app |
| UI and block editing smoke test | Local or deployed app |

Production URL: [https://pemfes-dzdfz.seliseblocks.com](https://pemfes-dzdfz.seliseblocks.com)

## Related Files

- [`submission.md`](submission.md)
- [`progress-report.md`](progress-report.md)
- [`../README.md`](../README.md)
- [`../DEPLOYMENT.md`](../DEPLOYMENT.md)
