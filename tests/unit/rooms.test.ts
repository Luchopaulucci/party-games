import { describe, expect, it } from "vitest";
import { RoomManager } from "@/server/room-manager";
import { ONLINE_MODE_ERROR, supportsMode } from "@/shared/games/browse";
import { UNKNOWN_GAME_ERROR } from "@/shared/protocol";
import { GAME_IDS } from "@/shared/types";

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

  it("no explota con name/code que no son string y filtra categorías", () => {
    const mgr = new RoomManager({ allowTestSeeds: true, sweepIntervalMs: 0 });
    expect(mgr.createRoom(123).ok).toBe(false);
    expect(mgr.createRoom({ replace: () => "x" }).ok).toBe(false);
    expect(mgr.joinRoom(123, "Lucho").ok).toBe(false);
    expect(mgr.joinRoom({ trim: () => "AAAA" }, "Lucho").ok).toBe(false);
    const host = mgr.createRoom("Lucho");
    expect(host.ok).toBe(true);
    if (!host.ok) return;
    mgr.joinRoom(host.code, "Meli");
    const error = mgr.startGame(host.code, host.playerId, "closest", { prompt: "x", trueAnswer: 1 }, {
      categories: ["animales", "no-existe", 4 as unknown as string],
      picante: "sí" as unknown as boolean,
      options: { timerSec: 45, impostorCount: 99, extra: true },
    });
    expect(error).toBeNull();
    const room = mgr.rooms.get(host.code)!;
    expect(room.categories).toEqual(["animales"]);
    expect(room.picante).toBe(false);
    expect(room.options).toEqual({ timerSec: 45 });
    mgr.dispose();
  });

  it("borra salas vacías/inactivas y limpia timers", () => {
    let now = 1_000;
    const mgr = new RoomManager({
      allowTestSeeds: true,
      hostGraceMs: 5_000,
      emptyRoomTtlMs: 500,
      inactiveRoomTtlMs: 5_000,
      sweepIntervalMs: 0,
      now: () => now,
    });
    const keep = mgr.createRoom("Viva");
    const empty = mgr.createRoom("Huérfana");
    const idle = mgr.createRoom("Olvidada");
    expect(keep.ok && empty.ok && idle.ok).toBe(true);
    if (!keep.ok || !empty.ok || !idle.ok) return;
    const guest = mgr.joinRoom(empty.code, "Invitado");
    expect(guest.ok).toBe(true);
    if (!guest.ok) return;

    mgr.attachSocket(empty.code, empty.token, "s-empty-host");
    mgr.attachSocket(empty.code, guest.token, "s-empty-guest");
    mgr.detachSocket("s-empty-host");
    expect(mgr.hasHostTimer(empty.code)).toBe(true);
    mgr.detachSocket("s-empty-guest");

    now += 600;
    mgr.sweepRooms();
    expect(mgr.rooms.has(empty.code)).toBe(false);
    expect(mgr.hasHostTimer(empty.code)).toBe(false);
    expect(mgr.rooms.has(keep.code)).toBe(true);
    expect(mgr.rooms.has(idle.code)).toBe(true);

    now += 5_000;
    mgr.sweepRooms();
    expect(mgr.rooms.has(keep.code)).toBe(false);
    expect(mgr.rooms.has(idle.code)).toBe(false);
    mgr.dispose();
  });

  it("rechaza startGame con cada uno de los 8 ids borrados y no crashea", () => {
    const mgr = new RoomManager({ allowTestSeeds: true, sweepIntervalMs: 0 });
    const host = mgr.createRoom("Lucho");
    expect(host.ok).toBe(true);
    if (!host.ok) return;
    mgr.joinRoom(host.code, "Meli");
    const removed = [
      "subasta",
      "dibuja",
      "onda",
      "taboo",
      "bombita",
      "mimica",
      "verdad-reto",
      "telefono",
    ];
    for (const gameId of removed) {
      const error = mgr.startGame(host.code, host.playerId, gameId);
      expect(error, gameId).toBe(UNKNOWN_GAME_ERROR);
      const room = mgr.rooms.get(host.code)!;
      expect(room.status, gameId).toBe("lobby");
      expect(room.gameId, gameId).toBeNull();
    }
    const ok = mgr.startGame(host.code, host.playerId, "closest", { prompt: "x", trueAnswer: 1 });
    expect(ok).toBeNull();
    expect(mgr.rooms.get(host.code)!.gameId).toBe("closest");
    mgr.dispose();
  });

  it("si sale el anfitrión se borra la sala; si sale otro, no", () => {
    const mgr = new RoomManager({ allowTestSeeds: true, sweepIntervalMs: 0 });
    const host = mgr.createRoom("Lucho");
    expect(host.ok).toBe(true);
    if (!host.ok) return;
    const guest = mgr.joinRoom(host.code, "Meli");
    expect(guest.ok).toBe(true);
    if (!guest.ok) return;
    const guestLeft = mgr.leaveRoom(host.code, guest.playerId);
    expect(guestLeft).toEqual({ closed: false });
    expect(mgr.rooms.get(host.code)?.seats.map((s) => s.name)).toEqual(["Lucho"]);
    const hostLeft = mgr.leaveRoom(host.code, host.playerId);
    expect(hostLeft).toMatchObject({ closed: true });
    expect(mgr.rooms.has(host.code)).toBe(false);
    mgr.dispose();
  });

  it("arranca cada juego online y rechaza yo-nunca", () => {
    const mgr = new RoomManager({ allowTestSeeds: true, sweepIntervalMs: 0 });
    const host = mgr.createRoom("Lucho");
    expect(host.ok).toBe(true);
    if (!host.ok) return;
    mgr.joinRoom(host.code, "Meli");
    mgr.joinRoom(host.code, "Coco");
    mgr.joinRoom(host.code, "Wanda");
    for (const gameId of GAME_IDS.filter((id) => supportsMode(id, "online"))) {
      const back = mgr.toLobby(host.code, host.playerId);
      expect(back, gameId).toBeNull();
      const error = mgr.startGame(host.code, host.playerId, gameId);
      expect(error, gameId).toBeNull();
      expect(mgr.rooms.get(host.code)!.gameId, gameId).toBe(gameId);
      expect(mgr.rooms.get(host.code)!.status, gameId).toBe("playing");
    }
    const never = mgr.startGame(host.code, host.playerId, "yo-nunca");
    expect(never).toBe(ONLINE_MODE_ERROR);
    expect(mgr.rooms.get(host.code)!.gameId).not.toBe("yo-nunca");
    mgr.dispose();
  });
});
