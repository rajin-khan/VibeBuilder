# Blockloom Academic Submission

<p align="center">
  <img src="../public/favicon.png" alt="Blockloom app icon" width="76" height="76" />
</p>

<p align="center">
  <strong>CSE226 · Spring 2026</strong><br />
  <strong>Student:</strong> Rajin Khan (`@rajin-khan`)<br />
  <strong>NSU ID:</strong> 2212708042
</p>

---

## Start Here

This folder contains the academic submission material for **Blockloom**, a visual website builder created for the Selise Blocks Project.

| File | Purpose |
| --- | --- |
| [`submission.md`](submission.md) | This index and grading guide. |
| [`installation.md`](installation.md) | Setup, local testing, quality checks, and deployment notes. |
| [`progress-report.md`](progress-report.md) | Formal progress report with requirements mapping and screenshots. |
| [`VIDEO_LINK.txt`](VIDEO_LINK.txt) | Plain-text demo video URL. |
| [`assets/`](assets/) | Screenshots used by the report and README. |

## Demo Video

[BlockLoom Demo.mp4 on Google Drive](https://drive.google.com/file/d/1i8G2NsF6rU3TOiz0Xzh21VPIilmp1Q1R/view?usp=sharing)

## Source Code

[github.com/rajin-khan/VibeBuilder](https://github.com/rajin-khan/VibeBuilder)

The repository name remains `VibeBuilder` because it was created before the final product was renamed to **Blockloom**.

## Deployed Application

[https://pemfes-dzdfz.seliseblocks.com](https://pemfes-dzdfz.seliseblocks.com)

Use the deployed app for the full SELISE-backed path:

- Sign up or sign in with IAM.
- Create a site and pages.
- Edit content in the builder.
- Save and publish.
- Open the public `/site/...` route.

Local development is best for UI/editor testing through **Continue in demo workspace**. See [`installation.md`](installation.md) for the difference between local and deployed behavior.

## Submission Bundle

| Item | Location |
| --- | --- |
| Product overview | [`../README.md`](../README.md) |
| Academic index | [`submission.md`](submission.md) |
| Install guide | [`installation.md`](installation.md) |
| Progress report | [`progress-report.md`](progress-report.md) |
| Deployment guide | [`../DEPLOYMENT.md`](../DEPLOYMENT.md) |
| Demo video URL | [`VIDEO_LINK.txt`](VIDEO_LINK.txt) |
| Screenshots | [`assets/`](assets/) |
| Codex interaction log | [`../chat-logs/codex-side.md`](../chat-logs/codex-side.md) |
| Cursor interaction log | [`../chat-logs/cursor-side.md`](../chat-logs/cursor-side.md) |

## Testing Summary

For the latest verification pass, run:

```bash
npm run lint
npm run build
npm test -- --run
```

The project has been repeatedly checked with Node 24 during the final build passes.

## License

Blockloom uses the [MIT License](../LICENSE).
