# React Published Package Consumer

Small Vite + React app that imports `shape-text` through the package name.

Inside this repo, Vite resolves that package name to the current local library source so the app can validate the next package surface before the next npm release.

It includes:

- geometry shape rendering
- value-derived text-mask rendering
- random fill presets with reroll
- direct custom fill-text editing

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
