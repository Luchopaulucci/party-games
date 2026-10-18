import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { handleHttp } from "./health";
import { createRealtimeServer } from "./realtime";

const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? (isProd ? 3000 : 3001));

async function main() {
  let nextHandler: ((req: IncomingMessage, res: ServerResponse) => Promise<void>) | null = null;

  if (isProd) {
    const next = (await import("next")).default;
    const app = next({ dev: false, dir: process.cwd() });
    await app.prepare();
    const handle = app.getRequestHandler();
    nextHandler = (req, res) => handle(req, res);
  }

  const httpServer = createServer((req, res) => {
    handleHttp(req, res, nextHandler);
  });

  createRealtimeServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(port, "0.0.0.0", resolve);
  });

  console.log(`[party-games] socket+http en :${port} (${isProd ? "prod" : "dev"})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
