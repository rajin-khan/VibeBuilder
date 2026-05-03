# Blockloom — Course submission index

**Author:** [Rajin Khan](https://github.com/rajin-khan) (`@rajin-khan`)  
**NSU ID:** 2212708042  
**Course:** CSE226 · Spring 2026  

---

## Start here

1. Read this file (`submission.md`) top to bottom — it explains what is in the bundle and how to evaluate the project.  
2. Open **`installation.md`** for step-by-step local setup, quality checks, and how that differs from the **deployed** app.  
3. Open **`docs/PROGRESS_REPORT.md`** for the formal progress write-up (screenshots, requirements coverage).

**Format:** This submission uses **Markdown** and the project zip only — **no PDF** files are included.

---

## Demo video

**Walkthrough:** [BlockLoom Demo.mp4 on Google Drive](https://drive.google.com/file/d/1i8G2NsF6rU3TOiz0Xzh21VPIilmp1Q1R/view?usp=sharing)

The same URL is in root **`VIDEO_LINK.txt`** for quick copy-paste when zipping the submission.

---

## Source code repository

**GitHub (canonical, always latest):**  
[https://github.com/rajin-khan/VibeBuilder](https://github.com/rajin-khan/VibeBuilder)

The **project zip** you receive should match a tagged commit or the stated SHA; if in doubt, treat the **GitHub `main` branch** as ground truth.

---

## Deployed application (full experience)

**Production URL:**  
[https://pemfes-dzdfz.seliseblocks.com](https://pemfes-dzdfz.seliseblocks.com)

**Use this URL to grade “real” behavior:**

- **Sign up / sign in** with an IAM-backed account (captcha and redirects are aligned with this **application domain**).  
- **Create sites and pages**, **save**, **publish**, and open **live** routes under `/site/...`.  
- **Cloud persistence** (Data Gateway, storage) is wired for this deployment.

**Local development does not fully replicate that:** see **installation.md** — on `localhost`, use **“Continue in demo workspace”** for a self-contained editor experience, or expect IAM/CORS issues unless you replicate production env and allowlists.

---

## What is in the submission zip (checklist)

| Item | Description |
| --- | --- |
| **Project zip** | Full repository source (this folder tree): app, `README.md`, `DEPLOYMENT.md`, `docs/` (progress report + screenshots), tests, etc. |
| **submission.md** | This file — index, links, and grading guidance. |
| **installation.md** | Install, run, test; points back here first. |
| **docs/PROGRESS_REPORT.md** | Formal progress report (Markdown + embedded images). |
| **chat-logs/codex-side.md** | Primary, chronological export of **Codex** sessions (large file). |
| **chat-logs/cursor-side.md** | Export of **Cursor** agent/chat sessions used when switching tools. |
| **VIDEO_LINK.txt** | Plain-text copy of the demo video URL (Google Drive). |

### AI tooling / interaction history

Work progressed mostly in **Codex** (`chat-logs/codex-side.md`). When **Codex hit usage limits**, development continued in **Cursor** (`chat-logs/cursor-side.md`). The two logs are **alternating complements**, not duplicates: read **Codex first** for the longest continuous trace, then **Cursor** for follow-on tasks and merges.

---

## In-repo documentation map

| Path | Purpose |
| --- | --- |
| `README.md` | Product overview, stack, quick start. |
| `installation.md` | Detailed install + local vs deployed testing (read after this file). |
| `DEPLOYMENT.md` | Hosting, env vars, Data Gateway notes. |
| `docs/PROGRESS_REPORT.md` | Formal progress report + NSU ID + screenshots. |
| `docs/assets/*.png` | Screenshots referenced from README / report. |

---

## How to test properly (summary)

1. **Deployed site:** Log in → dashboard → editor → publish → open public `/site/...` (full path).  
2. **Local zip:** Follow **installation.md** — use **demo workspace** for a frictionless pass; optional full IAM only if `.env` matches your project and origins are allowed.

---

## License

Project license: **MIT** — see `LICENSE` in the repository.

---

*End of submission index.*
