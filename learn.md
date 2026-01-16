# Backend Build Journey (Learn Log)

This file documents our step-by-step journey building the backend for this project.
It’s written so “future me” can come back and re-learn the concepts we used.

## 0) Where we are now

- Frontend (Vite + React + TS) is running and already “backend-ready”.
- Frontend calls these endpoints (no `/api` prefix):
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET/POST/PUT/DELETE /notes`
  - `GET/POST/PUT/DELETE /projects`
- We will implement a backend that supports both:
  - the frontend paths above, and
  - the Backend PRD paths (with `/api/...`) for compatibility.

## 1) Backend goals (from PRDs)

From PRD.md and BackendPRD.md:

- Node.js + Express
- MongoDB (Atlas Free Tier) + Mongoose
- JWT auth (access token)
- bcrypt password hashing
- Clean architecture: routes → controllers → services → models
- Protected routes for user-specific data isolation

## 2) Folder structure we’re building

We’ll create:

```
backend/
  src/
    server.ts
    app.ts
    config/db.ts
    controllers/
    middleware/
    models/
    routes/
    utils/
    types/
  package.json
  tsconfig.json
  .env.example
```

Why TypeScript?
- The frontend already uses TS.
- TS catches common backend mistakes early (wrong types, missing fields).

## 3) Concepts we’ll learn along the way

### Express request lifecycle
Request → middleware → route handler → controller → service → DB → response.

### JWT
JWT is a signed token that proves “this request is from user X”.
We’ll:
- Sign a token at login/register.
- Verify it on protected routes.
- Put it in `Authorization: Bearer <token>`.

### Mongoose
Mongoose gives:
- schemas (shape + validation)
- models (query API)
- document lifecycle hooks

### CORS (dev)
Frontend dev server runs at `http://localhost:8080`.
Backend will run at `http://localhost:3000`.
CORS allows the browser to call the backend from a different origin.

## 4) Day 1 — Create backend scaffold

We will:
1. Add `backend/package.json` and install dependencies
2. Create `server.ts` and `app.ts`
3. Add Mongo connection
4. Add routes for auth/notes/projects
5. Run backend locally

## 4.1) MongoDB setup (pick ONE)

### Option A — MongoDB Atlas (recommended)

Why: no local install, works everywhere.

1) Create an account at MongoDB Atlas and create a **free tier** cluster.

2) Create a database user (username + password).

3) Network Access → allow your IP:
- easiest during dev: add `0.0.0.0/0` (allows all). You can tighten later.

4) Get your connection string:
- Go to Cluster → Connect → Drivers → copy the URI.

5) Put it into `backend/.env` as `MONGODB_URI`.

Example:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

### Option B — Local MongoDB

1) Install MongoDB Community Server.
2) Ensure the Mongo service is running.
3) Use:

```
MONGODB_URI=mongodb://127.0.0.1:27017/ai-knowledge-hub
```


### Commands (run in a terminal)

From repo root:

```
cd backend
npm install
npm run dev
```

Once backend is running, we can switch the frontend to real API mode:

1) Create `ai-knowledge-hub/.env.local` (do not commit secrets)

```
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000
```

2) Restart the frontend dev server.

## 5) Troubleshooting notes

- If Mongo connection fails:
  - verify `MONGODB_URI` in `backend/.env`
  - ensure your IP is allowed in MongoDB Atlas Network Access
- If requests fail in browser:
  - check CORS origin
  - check backend logs

## 6) Day 2 — Wire the frontend to the real backend

Now that the backend is running at `http://127.0.0.1:3000`, we can switch the frontend from mock mode to real API mode.

We do this by creating `.env.local` (Vite reads it automatically):

```
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://127.0.0.1:3000
```

What this changes:
- `VITE_USE_MOCK_API=false` → frontend stops using `localStorage` mock DB.
- `VITE_API_BASE_URL=...` → frontend `fetch` calls go to the Express server.

Expected behavior after switching:
- Login/Register should create real users in MongoDB.
- Notes/Projects pages should load from the backend (empty at first for new users).

