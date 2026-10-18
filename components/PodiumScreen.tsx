import { playerColor } from "@/components/PlayerList";

const LINES = [
  "Se lleva el fernet y la corona de cartón.",
  "Segundo: casi, pero el asado se le quemó.",
  "Tercero: participó, que ya es mucho.",
  "Vino, charló, no ganó. Como en la vida.",
];

export function PodiumScreen({
  players,
  youId,
  nightLabel,
}: {
  players: { id: string; name: string; score: number; color?: string }[];
  youId?: string;
  nightLabel?: string | null;
}) {
  const ranked = [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const top = ranked[0];
  const spread = (ranked[0]?.score ?? 0) - (ranked[ranked.length - 1]?.score ?? 0);
  return (
    <div className="stack">
      <p className="kicker">{nightLabel ?? "Podio de la previa"}</p>
      <h2>{top ? `${top.name} se la lleva` : "Empate eterno"}</h2>
      <p className="lead">
        {spread <= 1 ? "Estuvo más parejo que un 0-0 en el clásico." : "Hubo clase y hubo turismo."}
      </p>
      <div className="players">
        {ranked.map((p, i) => (
          <div className="player" key={p.id}>
            <span className="swatch" style={{ background: playerColor(p, i) }} />
            <strong style={{ flex: 1 }}>
              {i + 1}. {p.name}
              {p.id === youId ? " (vos)" : ""}
            </strong>
            <div className="score">{p.score}</div>
          </div>
        ))}
      </div>
      <p className="lead" style={{ margin: 0 }}>
        {LINES[Math.min(ranked.findIndex((p) => p.id === youId), LINES.length - 1)] ?? LINES[3]}
      </p>
    </div>
  );
}
