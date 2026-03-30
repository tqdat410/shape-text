# Code Standards

## Core Rules

- Keep code files under 200 LOC
- Use descriptive kebab-case file names
- Prefer pure functions for geometry and layout
- Keep browser measurement isolated behind a `TextMeasurer` interface
- Do not mix geometry calculation with rendering

## Scope Rules

- V1 is polygon-only
- V1 is browser-first
- Advanced i18n fidelity can be added later without breaking the public shape-first API

## Testing Rules

- Test layout logic with a deterministic measurer
- Test SVG output with string assertions
- Keep tests focused on behavior, not implementation details

