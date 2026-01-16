import { loadEnv } from "./config/env.js";

loadEnv();

import { connectToDb } from "./config/db.js";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

async function main() {
  await connectToDb();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[backend] failed to start", err);
  process.exit(1);
});
