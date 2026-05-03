# Contributing to Blockloom

Thanks for your interest in **Blockloom**. This repository is primarily a course capstone project; small fixes and documentation improvements are welcome.

## How to contribute

### Reporting issues

Open an issue on [github.com/rajin-khan/VibeBuilder](https://github.com/rajin-khan/VibeBuilder) with:

- A short description and steps to reproduce (for bugs)
- Environment (OS, Node version, browser)
- Screenshots if relevant

### Pull requests

1. Fork the repository and create a branch from `main`.
2. Make focused changes; run `npm run lint` and `npm test -- --run`.
3. Open a PR with a clear summary following **Conventional Commits** (this repo uses commitlint).

## Development setup

```bash
npm install
npm run dev
```

Use `.env.example` as a template for local environment variables.

## Code style

- **Prettier:** `npm run format`
- **ESLint:** `npm run lint`

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).
