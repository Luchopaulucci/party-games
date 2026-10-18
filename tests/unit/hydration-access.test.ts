import { describe, expect, it } from "vitest";
import { initialOnlineAccess } from "@/lib/online-access";
import { resolveOnlineAccess } from "@/lib/online";
import { detectDevice } from "@/lib/device";

describe("hydration online access", () => {
  it("el primer valor es fijo (web online) y no lee navigator ni Capacitor", () => {
    const first = initialOnlineAccess();
    expect(first).toEqual(resolveOnlineAccess({ native: false, online: true, socketUrl: undefined }));
    expect(first).toEqual({ ok: true });
  });

  it("detectDevice no toca window (mismo default en server y cliente)", () => {
    expect(detectDevice()).toBe("phone");
    expect(detectDevice(390)).toBe("phone");
    expect(detectDevice(900)).toBe("tablet");
  });
});
