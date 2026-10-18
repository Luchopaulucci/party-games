const nameList = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

export function formatNameList(names: string[]): string {
  return nameList.format(names);
}

export function winnerHeadline(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return `¡${names[0]} se quedó más cerca!`;
  return `¡Empate entre ${formatNameList(names)}!`;
}

export function formatReveal(value: number, target: number, unit?: string): string {
  const yearish = Number.isInteger(target) && target >= 1000 && target <= 2200 && !unit;
  const decimals = Number.isInteger(target) ? 0 : 2;
  const shown = decimals === 0 ? Math.round(value) : value;
  return new Intl.NumberFormat("es-AR", {
    useGrouping: !yearish,
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(shown);
}
