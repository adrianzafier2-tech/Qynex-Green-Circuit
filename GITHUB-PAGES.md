# Publish QYNEX: Green Circuit for free with GitHub Pages

## 1. Create a GitHub repository

Create a **public** repository named `qynex-green-circuit`.

## 2. Upload this project

Upload the contents of this folder, including `package.json`, `vite.config.js`, `index.html`, `manifest.json`, and the `src` folder.

## 3. Build the project

On a computer with Node.js installed:

```bash
npm install
npm run build
```

This creates the production files in `dist/`.

## 4. Deploy

For the simplest GitHub Pages setup, use a GitHub Actions workflow that runs `npm install`, `npm run build`, and publishes `dist/`.

Alternatively, if you already use a static-hosting workflow, point it at the generated `dist/` folder.

## Important

The Vite config uses `base: './'`, so the built assets work when the site is hosted at a GitHub Pages project URL such as:

`https://YOUR-USERNAME.github.io/qynex-green-circuit/`

The app no longer uses the Base44 SDK or Base44 Vite plugin.
