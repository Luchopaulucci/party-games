const nameList = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

export function formatNameList(names: string[]): string {
  return nameList.format(names);
}

export function winnerHeadline(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return `¡${names[0]} se quedó más cerca!`;
  return `¡Empate entre ${formatNameList(names)}!`;
}

const YEAR_UNITS = new Set(["año", "años", "anio", "anios"]);

export function isYearUnit(unit?: string): boolean {
  return Boolean(unit && YEAR_UNITS.has(unit.trim().toLowerCase()));
}

export function isCalendarYear(target: number, unit?: string): boolean {
  if (!Number.isInteger(target) || target < 1000 || target > 2200) return false;
  return !unit || isYearUnit(unit);
}

export function formatRevealUnit(target: number, unit?: string): string | undefined {
  if (!unit) return undefined;
  if (isCalendarYear(target, unit)) return undefined;
  if (isYearUnit(unit)) return Math.abs(Math.round(target)) === 1 ? "año" : "años";
  return unit.trim();
}

export function formatNumberEs(value: number, grouping: boolean, decimals: number): string {
  return new Intl.NumberFormat("es-AR", {
    useGrouping: grouping,
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatReveal(value: number, target: number, unit?: string): string {
  const calendar = isCalendarYear(target, unit);
  const yearUnit = isYearUnit(unit);
  const decimals = Number.isInteger(target) || calendar || yearUnit ? 0 : 2;
  const shown = decimals === 0 ? Math.round(value) : value;
  return formatNumberEs(shown, !(calendar || yearUnit), decimals);
}
