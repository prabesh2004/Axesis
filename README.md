# Axesis

Axesis is an AI-powered career development + knowledge hub.

It includes a React (Vite) frontend and an Express (TypeScript) backend backed by MongoDB Atlas.

## Features

- Auth (email/password) + Google sign-in
- Notes, Projects, Goals
- Resume upload + AI resume analysis
- AI insights/skill progress endpoints

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui, framer-motion
- Backend: Node.js, Express, TypeScript, Mongoose
- Database: MongoDB Atlas

## Repo structure

```
.
├── src/            # frontend source
├── public/         # frontend public assets
├── backend/        # express + typescript api
└── README.md
```

## Local development

### Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- A MongoDB Atlas connection string

### 1) Install dependencies

From the repo root:

```bash
npm install
```

Then install backend deps:

```bash
cd backend
npm install
```

### 2) Configure environment variables

#### Backend (`backend/.env`)

Create `backend/.env` (this project loads it from the backend folder):

```bash
# Server
PORT=3000
NODE_ENV=development

# Mongo
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

# Auth
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d

# CORS (comma-separated). You can also use wildcards like https://*.netlify.app
CORS_ORIGIN=http://localhost:5173

# Google login (required only if you use /auth/google)
GOOGLE_CLIENT_ID=

# AI providers (required only for the endpoints you use)
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant

GEMINI_API_KEY=
GEMINI_MODEL=models/gemini-1.5-flash

# Resume analysis via OpenRouter (Step model)
STEP_API_KEY=
STEP_MODEL=stepfun/step-3.5-flash:free
OPENROUTER_SITE_URL=
OPENROUTER_APP_TITLE=Axesis
```

#### Frontend (`.env` in repo root)

Optional. If you don’t set these, it defaults to `http://localhost:3000` and mock API enabled.

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK_API=false
VITE_GOOGLE_CLIENT_ID=
```

### 3) Run the apps

Backend (in `backend/`):

```bash
npm run dev
```

Frontend (in repo root):

```bash
npm run dev
```

Open: `http://localhost:5173`

## API notes

- Backend exposes routes in two styles for compatibility:
	- `/auth`, `/notes`, `/projects`, `/goals`, `/ai`, `/resume`
	- `/api/auth`, `/api/notes`, `/api/projects`, `/api/goals`, `/api/ai`, `/api/resume`
- Health check: `GET /health` → `{ "ok": true }`

## Scripts

### Frontend

- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run lint` – ESLint
- `npm run preview` – preview the production build

### Backend

From `backend/`:

- `npm run dev` – run with watch mode
- `npm run build` – TypeScript compile to `dist/`
- `npm start` – run `dist/server.js`

## Deployment (reference)

One working setup is:

- Frontend: Netlify
	- Set `VITE_API_BASE_URL` to your backend URL
	- SPA routing is handled by `public/_redirects`
- Backend: Render
	- Set backend env vars in Render (do not rely on local `.env`)
	- Ensure MongoDB Atlas Network Access allows Render

