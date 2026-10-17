"use client";

import type { GameId } from "@/shared/types";
import { ClosestView } from "./ClosestView";
import { WhoAmIView } from "./WhoAmIView";
import { ImpostorView } from "./ImpostorView";
import { HigherLowerView } from "./HigherLowerView";
import { SpyView } from "./SpyView";
import { VoteView } from "./VoteView";
import type { ClosestPrivateView, ClosestPublicView } from "@/shared/games/closest/logic";
import type { WhoAmIPrivateView, WhoAmIPublicView } from "@/shared/games/whoami/logic";
import type { ImpostorPrivateView, ImpostorPublicView } from "@/shared/games/impostor/logic";
import type { HigherLowerPrivateView, HigherLowerPublicView } from "@/shared/games/higherlower/logic";
import type { SpyPrivateView, SpyPublicView } from "@/shared/games/spy/logic";
import type { VotePrivateView, VotePublicView } from "@/shared/games/vote/logic";

export function ActiveGame({
  gameId,
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
}: {
  gameId: GameId;
  publicView: unknown;
  privateView: unknown;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string }[];
  onAction: (type: string, payload?: unknown) => void;
}) {
  if (gameId === "closest") {
    return (
      <ClosestView
        publicView={publicView as ClosestPublicView}
        privateView={privateView as ClosestPrivateView}
        isHost={isHost}
        players={players}
        onAction={onAction}
      />
    );
  }
  if (gameId === "whoami") {
    return (
      <WhoAmIView
        publicView={publicView as WhoAmIPublicView}
        privateView={privateView as WhoAmIPrivateView}
        isHost={isHost}
        players={players}
        onAction={onAction}
      />
    );
  }
  if (gameId === "impostor") {
    return (
      <ImpostorView
        publicView={publicView as ImpostorPublicView}
        privateView={privateView as ImpostorPrivateView}
        isHost={isHost}
        youId={youId}
        players={players}
        onAction={onAction}
      />
    );
  }
  if (gameId === "mas-o-menos") {
    return (
      <HigherLowerView
        publicView={publicView as HigherLowerPublicView}
        privateView={privateView as HigherLowerPrivateView}
        isHost={isHost}
        players={players}
        onAction={onAction}
      />
    );
  }
  if (gameId === "espia") {
    return (
      <SpyView
        publicView={publicView as SpyPublicView}
        privateView={privateView as SpyPrivateView}
        isHost={isHost}
        youId={youId}
        players={players}
        onAction={onAction}
      />
    );
  }
  if (gameId === "votacion") {
    return (
      <VoteView
        publicView={publicView as VotePublicView}
        privateView={privateView as VotePrivateView}
        isHost={isHost}
        youId={youId}
        players={players}
        onAction={onAction}
      />
    );
  }
  return <p className="lead">Ese juego todavía está en el horno.</p>;
}
