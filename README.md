# Longclaw

A calm AI workspace for writing, coding with live preview, image generation, and Google Workspace commands.

## Deploy to GitHub Pages (Free, No Billing Required)

This repository includes an automatic GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) pre-configured for GitHub Pages with subpath routing, SPA `404.html` fallback, and `.nojekyll`.

### 1. Push to GitHub
Export or push this project to a GitHub repository on the `main` (or `master`) branch.

### 2. Enable GitHub Pages
1. Open your GitHub repository → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. The **Deploy Longclaw to GitHub Pages** workflow will run automatically (or trigger it manually from the **Actions** tab) and publish your site at `https://<your-username>.github.io/<repo-name>/`.

### 3. Enable Sign-In on Your GitHub Pages Domain
In the **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**, add:
```text
<your-username>.github.io
```

### 4. (Optional) Connect Live AI Replies on GitHub Pages
GitHub Pages hosts static frontend files only (it does not run the Node.js `/api/*` backend). To enable live AI chat and image generation on your GitHub Pages site:
1. Host `server.ts` on any free Node.js host (e.g., Render or Koyeb) with `GEMINI_API_KEY` configured (`npm run build` and `npm start`). The backend automatically allows CORS requests from `*.github.io` (and any custom domains set in `ALLOWED_ORIGINS`).
2. In your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Variables**, add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.example.com`
3. Re-run the **Deploy Longclaw to GitHub Pages** workflow.

## Local Development

```bash
npm install
npm run dev
```

Build locally for a GitHub Pages subpath:
```bash
VITE_BASE_PATH="/your-repo-name/" npm run build
```
