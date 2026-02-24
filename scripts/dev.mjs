/**
 * Admin ESA dev runner
 * - Uses PORT env if provided, otherwise 3000
 * - Avoids force-killing processes (safer for shared workstations)
 * - Works in Firebase Studio / Cloud Workstations and local dev
 */
import { spawn } from "node:child_process";

const port = Number(process.env.PORT || process.env.NEXT_PORT || 3000);
const host = process.env.HOSTNAME || "0.0.0.0";

const args = ["dev", "--port", String(port), "--hostname", host];

console.log(`[dev] Starting Next.js: next ${args.join(" ")}`);

const child = spawn("npx", ["next", ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("[dev] Failed to start Next.js:", err?.message || err);
  console.error(
    "[dev] If you see EADDRINUSE, set a different PORT, e.g. PORT=3001 npm run dev"
  );
  process.exit(1);
});
