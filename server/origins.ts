export const CAPACITOR_ORIGINS = ["capacitor://localhost", "https://localhost", "http://localhost"] as const;

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

export function resolveAllowedOrigins(input: {
  allowedOrigins?: string;
  renderExternalUrl?: string;
  nodeEnv?: string;
} = {}): string[] | true {
  const env = input.nodeEnv ?? process.env.NODE_ENV;
  const configured = parseOriginList(input.allowedOrigins ?? process.env.ALLOWED_ORIGINS);
  const render = parseOriginList(input.renderExternalUrl ?? process.env.RENDER_EXTERNAL_URL);
  if (env !== "production") return true;
  return uniqueOrigins(configured, render, CAPACITOR_ORIGINS);
}

export function isOriginAllowed(origin: string | undefined, allowed: string[] | true): boolean {
  if (allowed === true) return true;
  if (!origin) return true;
  const clean = origin.replace(/\/$/, "");
  return allowed.includes(clean);
}

export function socketIoCors(allowed: string[] | true = resolveAllowedOrigins()) {
  if (allowed === true) {
    return { origin: true, credentials: true as const };
  }
  return {
    origin(origin: string | undefined, callback: (err: Error | null, ok?: boolean) => void) {
      if (isOriginAllowed(origin, allowed)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origen no permitido"));
    },
    credentials: true as const,
  };
}
