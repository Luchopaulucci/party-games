export const CAPACITOR_ORIGINS = ["capacitor://localhost", "https://localhost", "http://localhost"] as const;

export type OriginPolicy =
  | true
  | {
      list: string[];
      allowLocalNetwork: boolean;
    };

export function parseOriginList(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((item) => item.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function uniqueOrigins(...lists: readonly (readonly string[])[]): string[] {
  return [...new Set(lists.flat().map((item) => item.replace(/\/$/, "")))];
}

export function selfOrigins(port: number): string[] {
  const hosts = ["localhost", "127.0.0.1"];
  const out: string[] = [];
  for (const host of hosts) {
    out.push(`http://${host}:${port}`, `https://${host}:${port}`);
  }
  return out;
}

function ipv4Parts(hostname: string): number[] | null {
  const parts = hostname.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return nums;
}

export function isLoopbackOrPrivateHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
  const ip = ipv4Parts(host);
  if (!ip) return false;
  const [a, b] = ip;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 127) return true;
  return false;
}

export function isLocalNetworkOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return isLoopbackOrPrivateHost(url.hostname);
  } catch {
    return false;
  }
}

export function resolveAllowedOrigins(input: {
  allowedOrigins?: string;
  renderExternalUrl?: string;
  nodeEnv?: string;
  port?: number;
} = {}): OriginPolicy {
  const env = input.nodeEnv ?? process.env.NODE_ENV;
  const configured = parseOriginList(input.allowedOrigins ?? process.env.ALLOWED_ORIGINS);
  const render = parseOriginList(input.renderExternalUrl ?? process.env.RENDER_EXTERNAL_URL);
  const port = Number(input.port ?? process.env.PORT ?? (env === "production" ? 3000 : 3001));
  if (env !== "production") return true;
  return {
    list: uniqueOrigins(selfOrigins(port), configured, render, CAPACITOR_ORIGINS),
    allowLocalNetwork: configured.length === 0,
  };
}

export function isOriginAllowed(origin: string | undefined, allowed: OriginPolicy | string[]): boolean {
  if (allowed === true) return true;
  if (!origin) return true;
  const clean = origin.replace(/\/$/, "");
  const list = Array.isArray(allowed) ? allowed : allowed.list;
  if (list.includes(clean)) return true;
  const allowLan = !Array.isArray(allowed) && allowed.allowLocalNetwork;
  return allowLan && isLocalNetworkOrigin(clean);
}

export function socketIoCors(allowed: OriginPolicy | string[] | true = resolveAllowedOrigins()) {
  if (allowed === true) {
    return { origin: true, credentials: true as const };
  }
  return {
    origin(origin: string | undefined, callback: (err: Error | null, ok?: boolean) => void) {
      if (isOriginAllowed(origin, allowed)) {
        callback(null, true);
        return;
      }
      console.warn(`[party-games] origen rechazado: ${origin ?? "(sin origin)"}`);
      callback(new Error("Origen no permitido"));
    },
    credentials: true as const,
  };
}
