"use client";

import { REACTION_EMOJIS } from "@/shared/protocol";
import type { RoomReaction } from "@/shared/types";
import { playFx } from "@/lib/fx";
import { useEffect, useRef } from "react";

export function ReactionsBar({
  reactions,
  onReact,
}: {
  reactions: RoomReaction[];
  onReact: (emoji: string) => void;
}) {
  const last = useRef<string>("");
  useEffect(() => {
    const newest = reactions[reactions.length - 1];
    if (newest && newest.id !== last.current) {
      last.current = newest.id;
      playFx("react");
    }
  }, [reactions]);

  return (
    <div className="stack">
      <div className="row" style={{ flexWrap: "wrap" }}>
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="btn btn-ghost"
            style={{ minWidth: 48, minHeight: 48, flex: "0 0 auto", padding: 10 }}
            onClick={() => onReact(emoji)}
            aria-label={`Reacción ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="lead" style={{ margin: 0, minHeight: 28 }} aria-live="polite">
        {reactions.slice(-6).map((r) => r.emoji).join(" ")}
      </div>
    </div>
  );
}
