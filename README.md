
# Word Journey Web

This is a Progressive Web App (PWA) reimplementation of the Word Journey Android game, built with React, TypeScript, and Vite. It is designed to run on all modern browsers (Android, iOS, Windows, Mac, Linux) and supports device-local progress, offline play, and feature gating for VIP/Android-only features.

## Features

- Full Word Journey gameplay experience in the browser
- Device-local progress persistence (localStorage)
- Lock overlays for VIP and Android-only features
- Responsive on-screen keyboard
- Installable as a PWA (Add to Home Screen)
- Test-driven development (Jest + React Testing Library)

## Getting Started

### Development

```bash
npm install
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) to view the app locally.

### Testing

```bash
npx jest --config=jest.config.cjs
```

## Deployment to GitHub Pages

This project is configured for deployment to GitHub Pages (as a `github.io` site):

1. Ensure your repository is named `word-journey-web` on GitHub.
2. Push your code to GitHub.
3. Deploy with:

   ```bash
   npm run deploy
   ```

This will build the app and publish the contents of the `dist` folder to the `gh-pages` branch. Your site will be available at:

```
https://<your-github-username>.github.io/word-journey-web/
```

## License

MIT
