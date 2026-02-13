import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";

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

const googleSchema = z.object({
  credential: z.string().min(1),
});

let googleClient: OAuth2Client | null = null;
function getGoogleClient() {
  if (!googleClient) googleClient = new OAuth2Client();
  return googleClient;
}

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

export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { credential } = googleSchema.parse(req.body);
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ message: "Google login is not configured (missing GOOGLE_CLIENT_ID)" });
    }

    const ticket = await getGoogleClient().verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const emailVerified = payload?.email_verified;

    if (!email) {
      return res.status(400).json({ message: "Google token did not include an email" });
    }
    if (emailVerified === false) {
      return res.status(401).json({ message: "Google email is not verified" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // We keep password auth intact by generating a random hash for Google-created accounts.
      const randomPassword = randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        name: (name && String(name).trim()) || email.split("@")[0],
        email: email.toLowerCase(),
        passwordHash,
      });
    }

    const token = signAccessToken(String(user._id));
    return res.json({ token, user: user.toJSON() });
  } catch (err) {
    return next(err);
  }
}
