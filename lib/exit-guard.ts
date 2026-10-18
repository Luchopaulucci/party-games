export function brandUsesConfirm(onExit?: (() => void) | null): boolean {
  return typeof onExit === "function";
}

export function shouldGuardNavigation(onExit?: (() => void) | null): boolean {
  return brandUsesConfirm(onExit);
}
