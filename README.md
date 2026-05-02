# Mobile Security Assessment

## Overview
Security posture dashboard and practitioner tooling for mobile application assessments. Stakeholders use the Dashboard to review portfolio-level risk summaries and prioritization insights. Security practitioners use Features, Risks, Apps, and Findings pages to document and maintain assessment data across multiple mobile applications.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (>= 18)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

## Project Structure

* `src/app` – Next.js routing (pages, layout)
* `src/features` – Feature-based modules (components, hooks, types)
* `src/shared` – Reusable components and utilities

## Notes / Assumptions

* All data is placeholder/mock — defined in `src/shared/utils/data.ts`
* Light/dark theme is toggled via the sidebar button; preference persists in `localStorage`
* Theme is applied via `data-theme="dark"` on `<html>` to avoid flash of unstyled content
* The Findings page groups risks by feature and tracks per-app At Risk / Reduced state locally via `useState`
* Form pages (Features, Risks, Apps) do not persist edits — state is local only
* `src/app/features/page.tsx` maps to `/features` (not to be confused with the `src/features/` directory which is the feature-module architecture pattern)

## Scope

* Frontend-only implementation
* No backend, API routes, or external services included
