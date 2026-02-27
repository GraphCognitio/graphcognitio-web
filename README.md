# GraphCognitio Frontend

React + TypeScript frontend for GraphCognitio.

## Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Set a public API base URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

`VITE_*` variables are bundled into client-side assets. Never place secrets in them.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Documentation

See [README-FRONTEND.md](./README-FRONTEND.md) for the full MVP scope, routes, UI system, and integration details.
