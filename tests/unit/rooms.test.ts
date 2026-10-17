import { describe, expect, it } from "vitest";
import { RoomManager } from "@/server/room-manager";

describe("RoomManager", () => {
  it("aísla salas y no filtra tokens en la proyección", () => {
    const mgr = new RoomManager({ allowTestSeeds: true, hostGraceMs: 50 });
    const a = mgr.createRoom("Hosta");
    const b = mgr.createRoom("Hostb");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    mgr.joinRoom(a.code, "P2");
    mgr.joinRoom(b.code, "Q2");
    const roomA = mgr.rooms.get(a.code)!;
    const view = mgr.project(roomA, a.playerId)!;
    const dumped = JSON.stringify(view);
    expect(dumped).not.toContain(a.token);
    expect(dumped).not.toContain(b.code);
    expect(view.players).toHaveLength(2);
    expect(view.players[0]!.color).toMatch(/^#/);
    expect(new Set(view.players.map((p) => p.color)).size).toBe(2);
    mgr.dispose();
  });

  it("recupera asiento y puntos con el token", () => {
    const mgr = new RoomManager({ allowTestSeeds: true });
    const host = mgr.createRoom("Lucho");
    expect(host.ok).toBe(true);
    if (!host.ok) return;
    mgr.joinRoom(host.code, "Meli");
    const room = mgr.rooms.get(host.code)!;
    room.seats[0]!.score = 9;
    room.seats[0]!.connected = false;
    const again = mgr.joinRoom(host.code, "Otronombre", host.token);
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.playerId).toBe(host.playerId);
    expect(room.seats[0]!.score).toBe(9);
    expect(room.seats[0]!.name).toBe("Lucho");
    mgr.dispose();
  });

  it("migra el host y lo deja reclamar", async () => {
    const mgr = new RoomManager({ allowTestSeeds: true, hostGraceMs: 40 });
    const host = mgr.createRoom("Anfi");
    const guest = host.ok ? mgr.joinRoom(host.code, "Invitado") : { ok: false as const, error: "x" };
    expect(host.ok && guest.ok).toBe(true);
    if (!host.ok || !guest.ok) return;
    mgr.attachSocket(host.code, host.token, "s-host");
    mgr.attachSocket(host.code, guest.token, "s-guest");
    mgr.detachSocket("s-host");
    await new Promise((r) => setTimeout(r, 80));
    const room = mgr.rooms.get(host.code)!;
    expect(room.hostId).toBe(guest.playerId);
    mgr.joinRoom(host.code, "Anfi", host.token);
    expect(room.hostId).toBe(host.playerId);
    mgr.dispose();
  });

  it("guarda categorías y picante al arrancar", () => {
    const mgr = new RoomManager({ allowTestSeeds: true });
    const host = mgr.createRoom("Lucho");
    expect(host.ok).toBe(true);
    if (!host.ok) return;
    mgr.joinRoom(host.code, "Meli");
    const error = mgr.startGame(host.code, host.playerId, "closest", { prompt: "x", trueAnswer: 1 }, {
      categories: ["animales"],
      picante: true,
    });
    expect(error).toBeNull();
    const room = mgr.rooms.get(host.code)!;
    expect(room.categories).toEqual(["animales"]);
    expect(room.picante).toBe(true);
    mgr.dispose();
  });
});
