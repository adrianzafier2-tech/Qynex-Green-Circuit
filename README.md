# QYNEX: Green Circuit

Standalone React/Vite game exported from the original prototype and prepared for independent static hosting.

## Run locally

```bash
npm install
npm run dev
```

## Build for hosting

```bash
npm run build
```

The production site is generated in `dist/` and can be hosted on GitHub Pages or another static host.

## Notes

- No Base44 SDK or Vite plugin is required.
- Game progress is stored locally in the browser.
- The game uses the existing QYNEX artwork URLs from the exported project. If you want a fully self-contained offline build, replace those URLs with local copies in `src/game/data.js`.
