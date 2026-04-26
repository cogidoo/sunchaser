# AGENTS.md

- This repository contains a static Vite/React/TypeScript web app in `app/` and OpenSpec artifacts in `openspec/`.
- The app is deployed to GitHub Pages from `.github/workflows/deploy.yml`.
- Use `oh-my-twin-agent.md` as the user's collaboration and review profile.
- Project-specific instructions in this file override `oh-my-twin-agent.md` when they conflict.
- For small tactical changes, keep ceremony low. For architecture, review, testing strategy, documentation, accessibility, or unclear requirements, apply the profile fully.
- Do not infer backend/server infrastructure for this project unless a new OpenSpec change explicitly introduces it.
- Verified app commands live in `app/package.json`: `npm run test`, `npm run lint`, and `npm run build`.
- The repository is a Git repo with `main` tracking `origin/main` at `https://github.com/cogidoo/sunchaser.git`.
