import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { User } from "../models/User.js";
import { signAccessToken } from "../utils/token.js";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: input.email }).lean();
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await User.create({ name: input.name, email: input.email, passwordHash });

    const token = signAccessToken(String(user._id));
    return res.json({ token, user: user.toJSON() });
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);

    const user = await User.findOne({ email: input.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signAccessToken(String(user._id));
    return res.json({ token, user: user.toJSON() });
  } catch (err) {
    return next(err);
  }
}
