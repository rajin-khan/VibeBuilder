# Blockloom — installation & local run

> **Read [`submission.md`](submission.md) first.**  
> It lists the demo video placeholder, GitHub repo, **deployed URL**, what is in the zip, and how **Codex vs Cursor** logs fit together.  
> This file focuses on **commands and environment** only.

---

## Requirements

- **Node.js** 20+ (24 LTS recommended; see `.nvmrc` if present).
- **npm** (comes with Node).

---

## Install dependencies

From the project root (the folder that contains `package.json`):

```bash
cd /path/to/VibeBuilder
npm install
```

---

## Run the app locally

```bash
npm run dev
```

Open **[http://127.0.0.1:3000/login](http://127.0.0.1:3000/login)** (or the URL Vite prints).

### Demo workspace (recommended on localhost)

Use **“Continue in demo workspace”** on the login page. Data is stored in **browser localStorage** only — no cloud account required. Use this to explore the **dashboard and editor** quickly.

### Full sign-in on localhost (optional / advanced)

Real **email + password** sign-in expects:

- A valid **`.env`** (copy from `.env.example`) with your project’s `VITE_*` values, **and**
- IAM / CORS configuration that allows **`http://localhost:3000`** (or your dev origin).

If you do not have that, **use the deployed site** for real accounts instead.

---

## Production build (sanity check)

```bash
npm run build
```

Output: `build/` (static files). Production bundle uses committed `.env.production` when you run the project’s production build script (see `package.json` — e.g. `npm run build:prod` if documented).

---

## Quality checks (optional)

```bash
npm run lint
npm test -- --run
```

---

## Where to test “for real”

| Goal | Where |
| --- | --- |
| Real IAM login, cloud save, publish, public `/site/...` | **Deployed:** [https://pemfes-dzdfz.seliseblocks.com](https://pemfes-dzdfz.seliseblocks.com) |
| Quick UI / editor pass without cloud | **Local** demo workspace |

---

## Further reading

- **Hosting & env:** [`DEPLOYMENT.md`](DEPLOYMENT.md)  
- **Submission index:** [`submission.md`](submission.md)  
- **Formal report:** [`docs/PROGRESS_REPORT.md`](docs/PROGRESS_REPORT.md)
