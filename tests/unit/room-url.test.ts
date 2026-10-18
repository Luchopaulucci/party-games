import { describe, expect, it } from "vitest";
import {
  legacySalaRedirect,
  parseRoomCode,
  roomPagePath,
  roomSharePath,
  roomShareUrl,
  shareOrigin,
} from "@/lib/room-url";

describe("rutas de sala", () => {
  it("el path canónico usa query y no un segmento dinámico", () => {
    expect(roomPagePath()).toBe("/online/sala");
    expect(roomPagePath({ code: "abcd" })).toBe("/online/sala?code=ABCD");
    expect(roomPagePath({ name: "Lucho", game: "impostor" })).toBe("/online/sala?name=Lucho&game=impostor");
    expect(roomPagePath({ code: "nueva", name: "Meli" })).toBe("/online/sala?name=Meli");
    expect(parseRoomCode("nueva")).toBeUndefined();
    expect(parseRoomCode("ab12")).toBe("AB12");
  });

  it("el link/QR sigue siendo /online?code= para el navegador", () => {
    expect(roomSharePath("ab12")).toBe("/online?code=AB12");
    expect(roomShareUrl("ab12", "https://previa.example/")).toBe("https://previa.example/online?code=AB12");
  });

  it("los links viejos /online/sala/ABCD redirigen al query y conservan name/game", () => {
    expect(legacySalaRedirect("ABCD")).toBe("/online/sala?code=ABCD");
    expect(legacySalaRedirect("nueva", { name: "Lucho", game: "impostor" })).toBe(
      "/online/sala?name=Lucho&game=impostor",
    );
    expect(legacySalaRedirect("xyzz", { name: "Meli", resume: "1" })).toBe(
      "/online/sala?code=XYZZ&name=Meli&resume=1",
    );
  });

  it("el origen del QR prioriza NEXT_PUBLIC_WEB_ORIGIN y no usa capacitor://", () => {
    expect(shareOrigin({ webOrigin: "https://la-previa.example/", windowOrigin: "https://localhost" })).toBe(
      "https://la-previa.example",
    );
    expect(shareOrigin({ native: true, windowOrigin: "https://localhost" })).toBe("");
    expect(shareOrigin({ native: false, windowOrigin: "https://previa.test" })).toBe("https://previa.test");
  });
});
