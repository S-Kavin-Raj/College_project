# Running all projects locally

This repo contains three separate Vite projects:

- `assigment_page` — assignment management UI (dev port 5173)
- `dashboard` — main dashboard (dev port 5174)
- `login_page` — login example (dev port 5175)

## Start all dev servers

From the repo root (d:\college management):

1. Install dependencies (once):

   npm install

2. Install root dev helper (once):

   npm install --save-dev

3. Start all dev servers together:

   npm run dev:all

This runs all 3 apps in one terminal using `concurrently`.

## Quick access

Open the root `index.html` in the repo root in your browser or click one of the links:

- http://localhost:5173 — Assignment Page
- http://localhost:5174 — Dashboard
- http://localhost:5175 — Login Page

## Notes

- To start a single project only, run `npm run dev --prefix ./dashboard` (or replace `dashboard` with other project names).
- If a port is already in use, change the port value in the project's `package.json` dev script (e.g., `vite --port 5176`).
