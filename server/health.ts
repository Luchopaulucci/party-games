import type { IncomingMessage, ServerResponse } from "node:http";

export const HEALTH_PATHS = ["/health", "/healthz"] as const;
export const HEALTH_BODY = "ok";

export function requestPath(url?: string): string {
  if (!url) return "/";
  try {
    return new URL(url, "http://local").pathname;
  } catch {
    return url.split("?")[0] || "/";
  }
}

export function isHealthPath(url?: string): boolean {
  return (HEALTH_PATHS as readonly string[]).includes(requestPath(url));
}

export function writeHealthOk(res: ServerResponse) {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end(HEALTH_BODY);
}

export function handleHttp(
  req: IncomingMessage,
  res: ServerResponse,
  nextHandler?: ((req: IncomingMessage, res: ServerResponse) => Promise<void>) | null,
) {
  if (isHealthPath(req.url)) {
    writeHealthOk(res);
    return;
  }
  if (nextHandler) {
    void nextHandler(req, res);
    return;
  }
  res.writeHead(404);
  res.end();
}
