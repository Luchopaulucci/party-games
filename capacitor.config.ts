import type { CapacitorConfig } from "@capacitor/cli";

export function createCapacitorConfig(env: NodeJS.Dict<string> = process.env): CapacitorConfig {
  const dev = env.CAP_DEV === "1";
  return {
    appId: "com.luchopaulucci.laprevia",
    appName: "La Previa",
    webDir: "out",
    server: {
      androidScheme: "https",
      ...(dev ? { cleartext: true } : {}),
    },
    android: {
      ...(dev ? { allowMixedContent: true } : {}),
    },
  };
}

const config = createCapacitorConfig();

export default config;
