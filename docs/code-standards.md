# Code Standards

## Core Rules

- Keep code files under 200 LOC
- Use descriptive kebab-case file names
- Prefer pure functions for geometry and layout
- Keep browser measurement isolated behind a `TextMeasurer` interface
- Do not mix geometry calculation with rendering

## Scope Rules

- V1 supports polygon and text-mask shapes
- Product framing should describe those as geometry input and value-derived input when talking about the user-facing feature set
- V1 is browser-first
- Advanced i18n fidelity can be added later without breaking the public shape-first API
- Keep shape compilation separate from content flow so hot paths can reuse cached bands
- Keep text formatting data-driven; do not pass framework components into the core API
- Keep shape decoration renderer-only unless it changes geometry

## Testing Rules

- Test layout logic with a deterministic measurer
- Test SVG output with string assertions
- Test browser-only glyph masking and workbench wiring through Playwright, not Node mocks
- Keep tests focused on behavior, not implementation details
- Do not expose private browser globals just to make E2E easier
- Keep `npm run ship:check` green before any release tag
- Release tags must match `package.json.version`
- CI must be required on `main` before merge
