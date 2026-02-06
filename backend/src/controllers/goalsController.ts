import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { Goal } from "../models/Goal.js";

const goalsSchema = z.object({
  targetRoles: z.array(z.string().trim().min(1)).default([]),
  interests: z.array(z.string().trim().min(1)).default([]),
});

export async function getGoals(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const existing = await Goal.findOne({ user: userId });
    if (existing) return res.json(existing.toJSON());

    const created = await Goal.create({ user: userId, targetRoles: [], interests: [] });
    return res.json(created.toJSON());
  } catch (err) {
    return next(err);
  }
}

export async function updateGoals(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = goalsSchema.parse(req.body);

    const updated = await Goal.findOneAndUpdate(
      { user: userId },
      { targetRoles: input.targetRoles, interests: input.interests },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    if (!updated) return res.status(500).json({ message: "Failed to update goals" });
    return res.json(updated.toJSON());
  } catch (err) {
    return next(err);
  }
}
