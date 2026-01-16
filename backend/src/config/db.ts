import mongoose from "mongoose";

export async function connectToDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  mongoose.set("strictQuery", true);

  // Fail fast during local dev instead of hanging for a long time.
  // This makes first-time setup much easier.
  // eslint-disable-next-line no-console
  console.log("[backend] connecting to MongoDB...");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  // eslint-disable-next-line no-console
  console.log("[backend] connected to MongoDB");
}
