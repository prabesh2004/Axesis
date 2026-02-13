import express from "express";
import cors from "cors";

import { errorMiddleware } from "./middleware/error.js";
import { authRouter } from "./routes/auth.js";
import { notesRouter } from "./routes/notes.js";
import { projectsRouter } from "./routes/projects.js";
import { goalsRouter } from "./routes/goals.js";
import { aiRouter } from "./routes/ai.js";
import { resumeRouter } from "./routes/resume.js";

export const app = express();

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
];

function getAllowedCorsOrigins(): string[] {
  const fromEnv = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return fromEnv.length ? fromEnv : DEFAULT_CORS_ORIGINS;
}

app.use(
  cors({
    origin: getAllowedCorsOrigins(),
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Support BOTH styles:
// - frontend: /auth, /notes, /projects
// - backend PRD: /api/auth, /api/notes
app.use("/auth", authRouter);
app.use("/notes", notesRouter);
app.use("/projects", projectsRouter);
app.use("/goals", goalsRouter);
app.use("/ai", aiRouter);
app.use("/resume", resumeRouter);

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/resume", resumeRouter);

app.use(errorMiddleware);
