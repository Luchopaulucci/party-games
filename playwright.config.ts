import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3010",
    viewport: { width: 375, height: 812 },
  },
  webServer: {
    command: "NODE_ENV=production PORT=3010 node dist/server/index.js",
    url: "http://127.0.0.1:3010",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
