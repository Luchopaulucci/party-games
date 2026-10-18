import { spawn } from "node:child_process";

const child = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  env: { ...process.env, MOBILE_EXPORT: "1" },
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
