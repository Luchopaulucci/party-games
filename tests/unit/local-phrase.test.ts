import { describe, expect, it } from "vitest";
import {
  advancePass,
  createLocalMatch,
  localAction,
  localView,
  startLocalGame,
  type LocalMatch,
} from "@/lib/local-match";
import type { PhraseState } from "@/shared/games/phrase/logic";

const NAMES_4 = ["Lucho", "Meli", "Coco", "Wanda"];

function startPhrase(names: string[]): LocalMatch {
  const started = startLocalGame(createLocalMatch(names), "completa-frase");
  if (typeof started === "string") throw new Error(started);
  return started;
}

function holder(match: LocalMatch) {
  return match.revealQueue[match.passIndex] ?? match.players[0]!.id;
}

function apply(match: LocalMatch, type: string, payload?: unknown): LocalMatch {
  const applied = localAction(match, holder(match), { type, payload });
  return advancePass(match, applied, type);
}

function playToVote(names: string[]): LocalMatch {
  let match = startPhrase(names);
  for (let i = 0; i < names.length; i++) {
    match = apply(match, "write", { text: `cierre ${i + 1} fernet` });
  }
  expect((match.gameState as PhraseState).phase).toBe("present");
  for (let i = 0; i < names.length; i++) {
    match = apply(match, "next");
  }
  expect((match.gameState as PhraseState).phase).toBe("vote");
  expect(match.passIndex).toBe(0);
  return match;
}

function voteOther(match: LocalMatch): LocalMatch {
  const voter = holder(match);
  const answers = (match.gameState as PhraseState).answers;
  const other = answers.find((a) => a.playerId !== voter);
  if (!other) throw new Error("sin frase ajena");
  return apply(match, "vote", { answerId: other.id });
}

describe("completa-frase local: voto por turno", () => {
  it("con 3 jugadores el voto arranca en el primero y el último revela", () => {
    let match = playToVote(NAMES_4.slice(0, 3));
    const first = holder(match);
    const mine = (match.gameState as PhraseState).answers.find((a) => a.playerId === first)!;
    const ignored = localAction(match, first, { type: "vote", payload: { answerId: mine.id } });
    expect(ignored.gameState).toBe(match.gameState);
    expect((ignored.gameState as PhraseState).votes[first]).toBeUndefined();

    match = voteOther(match);
    expect(match.passIndex).toBe(1);
    expect(match.status).toBe("playing");
    expect((match.gameState as PhraseState).phase).toBe("vote");

    const second = holder(match);
    expect(localView(match, second).private).toMatchObject({ myVote: null });
    expect(JSON.stringify(localView(match, second).public)).not.toMatch(/"votes":\{/);

    match = voteOther(match);
    expect(match.passIndex).toBe(2);
    match = voteOther(match);
    expect(match.status).toBe("finished");
    expect((match.gameState as PhraseState).phase).toBe("reveal");
  });

  it("con 4 jugadores nadie ve votos ajenos hasta el reveal", () => {
    let match = playToVote(NAMES_4);
    for (let i = 0; i < 3; i++) {
      match = voteOther(match);
      expect(match.status).toBe("playing");
      const next = holder(match);
      expect((localView(match, next).private as { myVote: string | null }).myVote).toBeNull();
      expect(JSON.stringify(localView(match, next).public)).not.toContain('"votes"');
    }
    match = voteOther(match);
    expect(match.status).toBe("finished");
    expect((match.gameState as PhraseState).phase).toBe("reveal");
  });
});
