import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const { userId } = verifyAccessToken(token);
    req.userId = userId;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
