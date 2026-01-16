import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export function loadEnv() {
  const here = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(here, "../..", ".env");
  dotenv.config({ path: envPath });
}
