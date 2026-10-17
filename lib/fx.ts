const KEY = "previa:fx";

export type FxKind = "reveal" | "join" | "react" | "score";

export function fxEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) !== "0";
}

export function setFxEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, on ? "1" : "0");
}

export function playFx(kind: FxKind) {
  if (typeof window === "undefined" || !fxEnabled()) return;
  try {
    window.navigator.vibrate?.(kind === "reveal" ? [18, 30, 18] : 12);
  } catch {
    /* ignore */
  }
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = kind === "react" ? "triangle" : "sine";
    osc.frequency.value = kind === "reveal" ? 523 : kind === "score" ? 392 : kind === "join" ? 330 : 660;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    window.setTimeout(() => ctx.close(), 200);
  } catch {
    /* ignore */
  }
}
