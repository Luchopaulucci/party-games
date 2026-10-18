import { createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { HEALTH_BODY, handleHttp, isHealthPath } from "@/server/health";

describe("health check", () => {
  const servers: Array<ReturnType<typeof createServer>> = [];

  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
          }),
      ),
    );
  });

  async function listen() {
    const server = createServer((req, res) => handleHttp(req, res));
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("sin puerto");
    return `http://127.0.0.1:${address.port}`;
  }

  it("reconoce /health y /healthz", () => {
    expect(isHealthPath("/health")).toBe(true);
    expect(isHealthPath("/healthz")).toBe(true);
    expect(isHealthPath("/healthz?ready=1")).toBe(true);
    expect(isHealthPath("/online")).toBe(false);
  });

  it("GET /healthz y /health responden 200 ok", async () => {
    const base = await listen();
    for (const path of ["/healthz", "/health"]) {
      const res = await fetch(`${base}${path}`);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe(HEALTH_BODY);
    }
    const missing = await fetch(`${base}/nope`);
    expect(missing.status).toBe(404);
  });
});
