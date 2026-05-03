# Contributing to Blockloom

<p align="center">
  <img src="public/favicon.png" alt="Blockloom app icon" width="56" height="56" />
</p>

Thanks for your interest in **Blockloom**. This repository is primarily an academic project submission, but the codebase is organized like a real product and welcomes focused improvements.

## Good Contributions

- Bug fixes with clear reproduction steps.
- Accessibility, contrast, or responsiveness improvements.
- Documentation improvements.
- Tests for existing builder behavior.
- Small refactors that preserve current functionality.

## Development Setup

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login), then use **Continue in demo workspace** for local testing.

## Before Opening a Pull Request

Run:

```bash
npm run lint
npm run build
npm test -- --run
```

Use a focused commit message. Conventional Commits are preferred, for example:

```text
fix: preserve selected block after reorder
docs: clarify deployment steps
```

## Project Context

Academic submission material lives in [`academic/`](academic/):

- [`academic/submission.md`](academic/submission.md)
- [`academic/installation.md`](academic/installation.md)
- [`academic/progress-report.md`](academic/progress-report.md)

## Conduct

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
