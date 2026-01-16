import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Central error handler.
// We return { message } so the frontend can show a toast.
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = err instanceof Error ? err.message : "Unexpected error";
  let details: unknown = undefined;

  if (err instanceof ZodError) {
    status = 400;
    message = "Invalid request";
    details = err.issues;
  } else if (err && typeof err === "object") {
    const maybe = err as { name?: unknown; message?: unknown };
    if (maybe.name === "CastError") {
      status = 400;
      message = "Invalid id";
    } else if (maybe.name === "ValidationError") {
      status = 400;
      message = typeof maybe.message === "string" ? maybe.message : "Validation error";
    }
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[backend] error", err);
  }

  res.status(status).json(details ? { message, details } : { message });
}
