# Blockloom Security Policy

<p align="center">
  <img src="public/favicon.svg" alt="Blockloom app icon" width="56" height="56" />
</p>

## Reporting A Vulnerability

Please do **not** open a public issue for undisclosed security problems.

Use one of these paths instead:

1. Open a private security advisory for [github.com/rajin-khan/VibeBuilder](https://github.com/rajin-khan/VibeBuilder/security/advisories/new), if available.
2. Contact the maintainer through [Rajin Khan’s GitHub profile](https://github.com/rajin-khan).

Include:

- A short summary.
- Affected area or route.
- Steps to reproduce.
- Potential impact.
- Suggested fix, if known.

## Scope

This policy covers the Blockloom application code in this repository.

It does **not** authorize testing against production systems, SELISE services, accounts, or third-party infrastructure without explicit permission.

## Secret Handling

Do not commit private secrets. Vite variables beginning with `VITE_` are embedded in browser JavaScript and must be treated as public client configuration.

## Disclosure

For valid reports, the maintainer will review, patch where appropriate, and coordinate disclosure responsibly.
