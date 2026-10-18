import Link from "next/link";
import { groupedCatalog } from "@/shared/games/browse";

export function GameCatalog() {
  return (
    <div className="stack">
      {groupedCatalog().map((group) => (
        <section key={group.id} className="category-section" data-testid={`group-${group.id}`}>
          <div className="category-section-head">
            <p className="kicker">{group.name}</p>
            <small>{group.blurb}</small>
          </div>
          <div className="stack">
            {group.games.map((game) => (
              <Link key={game.id} className="tile" href={`/juego/${game.id}`}>
                <span>{game.emoji}</span>
                <b>{game.name}</b>
                <p>{game.tagline}</p>
                <small>{game.minPlayers}+ jugadores</small>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
