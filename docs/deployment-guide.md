# Deployment Guide

## Release Model

- Canonical registry: npm
- Bun support: validated consumer/runtime path, not a second registry target
- CI workflow: `.github/workflows/ci.yml`
- Release workflow: `.github/workflows/release.yml`

## Required Repository Settings

### Branch Protection

Protect `main` with these minimum rules:

- require pull requests before merge
- require status checks to pass before merge
- require `Library Validation`
- require `Browser Integration`
- block force pushes

### Release Environment

Create a GitHub environment named `npm-release`.

Recommended:

- add at least one required reviewer before production publishes
- scope fallback publish secrets to this environment only

## npm Trusted Publishing

Trusted publishing is the preferred setup.

1. In npm package settings, add this GitHub repository and the `release.yml` workflow as a trusted publisher.
2. Keep `id-token: write` permission enabled in the release workflow.
3. Release by pushing a tag that matches `package.json.version`, for example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

With trusted publishing enabled, `npm publish --provenance --access public` can authenticate through GitHub OIDC without a long-lived npm token.

References:

- [npm trusted publishers](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance statements](https://docs.npmjs.com/generating-provenance-statements)

## Fallback Token Publishing

Use this only if trusted publishing cannot be enabled yet.

1. Create an npm automation token with publish rights for `shape-text`.
2. Store it in GitHub as `NPM_TOKEN`.
3. Prefer storing the secret on the `npm-release` environment instead of repository-wide secrets.

Do not commit `.npmrc` tokens to the repo.

## Maintainer Release Flow

1. Make sure the release PR is merged to `main`.
2. Pull the latest `main`.
3. Bump `package.json.version`.
4. Update changelog if the release needs curated notes beyond generated release notes.
5. Run:

```bash
npm run check
npm run ship:check
npm run e2e
```

6. Commit the version bump.
7. Push the commit to `main`.
8. Create and push the matching tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

9. Watch the `Release` workflow.
10. Verify:
  - npm package published
  - GitHub release created
  - `bun add shape-text` still works through the smoke path

## Failure Modes

### Tag/Version Mismatch

The release workflow runs `scripts/validate-release-tag.mjs` and fails if:

- tag is not semver-like
- tag does not exactly match `package.json.version`

### Trusted Publishing Not Configured

If trusted publishing is not configured and `NPM_TOKEN` is absent, the publish step fails. Fix settings first; do not retry blindly.

### Browser Regression On Release

The release workflow reruns Playwright before publish. If browser E2E fails, the package is not published.
