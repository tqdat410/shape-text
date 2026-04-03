# React Published Package Consumer

Small Vite + React app that imports `shape-text` through the package name.

Inside this repo, the app installs `shape-text` through a local file dependency. That keeps it on the real package exports instead of aliasing directly into `src/`.

It includes:

- a fullscreen ICT (`Asia/Bangkok`) clock rendered as `HH:mm:SS`
- a value-derived `text-mask` shape built from the current time string
- soft-light non-bold max-fill random text rendered inside each clock glyph region
- second-aligned refresh logic instead of interactive controls
- mixed fill families across visible regions, cycling through hex, binary, symbol, octal, and ASCII-style content
- a larger bottom-anchored SVG-mask hand section using warm skin-tone max-fill text and intentional lower-edge cropping
- small colocated Vitest coverage for the example's pure time/render helpers

## Run with npm

```bash
npm install
npm run dev
```

## Run with bun

```bash
bun install
bun run dev
```

Open `http://127.0.0.1:4175/`.

## Deploy to GitHub Pages

The repo now includes a GitHub Pages workflow that builds this example from the real packaged library output and publishes the generated `dist/` directory.

For the default repository Pages URL, the workflow injects:

```bash
VITE_BASE_PATH=/${repository-name}/
```

That keeps asset URLs correct for repo-scoped Pages deployments such as `https://tqdat410.github.io/shape-text/`.
