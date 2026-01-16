import jwt from "jsonwebtoken";

export function signAccessToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ sub: userId }, secret as jwt.Secret, { expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): { userId: string } {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  const payload = jwt.verify(token, secret as jwt.Secret) as unknown;
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid token");
  }

  const sub = (payload as { sub?: unknown }).sub;
  if (typeof sub !== "string" || sub.length === 0) {
    throw new Error("Invalid token subject");
  }

  return { userId: sub };
}
