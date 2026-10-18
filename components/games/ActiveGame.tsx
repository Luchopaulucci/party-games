"use client";

import { RoundTimer } from "@/components/RoundTimer";
import type { GameId } from "@/shared/types";
import { ClosestView } from "./ClosestView";
import { WhoAmIView } from "./WhoAmIView";
import { ImpostorView } from "./ImpostorView";
import { HigherLowerView } from "./HigherLowerView";
import { SpyView } from "./SpyView";
import { VoteView } from "./VoteView";
import { PhraseView } from "./PhraseView";
import { LieView } from "./LieView";
import { ReflexView } from "./ReflexView";
import { NeverView } from "./NeverView";
import { StopView } from "./StopView";
import { TriviaView } from "./TriviaView";
import { ChainView } from "./ChainView";
import { EmojiView } from "./EmojiView";
import { WouldView } from "./WouldView";
import type { ClosestPrivateView, ClosestPublicView } from "@/shared/games/closest/logic";
import type { WhoAmIPrivateView, WhoAmIPublicView } from "@/shared/games/whoami/logic";
import type { ImpostorPrivateView, ImpostorPublicView } from "@/shared/games/impostor/logic";
import type { HigherLowerPrivateView, HigherLowerPublicView } from "@/shared/games/higherlower/logic";
import type { SpyPrivateView, SpyPublicView } from "@/shared/games/spy/logic";
import type { VotePrivateView, VotePublicView } from "@/shared/games/vote/logic";
import type { PhrasePrivateView, PhrasePublicView } from "@/shared/games/phrase/logic";
import type { LiePrivateView, LiePublicView } from "@/shared/games/lie/logic";
import type { ReflexPrivateView, ReflexPublicView } from "@/shared/games/reflex/logic";
import type { NeverPrivateView, NeverPublicView } from "@/shared/games/never/logic";
import type { StopPrivateView, StopPublicView } from "@/shared/games/stop/logic";
import type { TriviaPrivateView, TriviaPublicView } from "@/shared/games/trivia/logic";
import type { ChainPrivateView, ChainPublicView } from "@/shared/games/chain/logic";
import type { EmojiPrivateView, EmojiPublicView } from "@/shared/games/emoji/logic";
import type { WouldPrivateView, WouldPublicView } from "@/shared/games/would/logic";

export function ActiveGame({
  gameId,
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
  timerSec,
  local,
}: {
  gameId: GameId;
  publicView: unknown;
  privateView: unknown;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string; color?: string }[];
  onAction: (type: string, payload?: unknown) => void;
  timerSec?: number;
  local?: boolean;
}) {
  const common = { isHost, players, onAction };
  const skipTimer = gameId === "impostor" || gameId === "emoji";
  return (
    <div className="stack" data-enter>
      {skipTimer ? null : <RoundTimer seconds={timerSec} active onTimeout={() => onAction("timeout")} />}
      {gameId === "closest" ? (
        <ClosestView publicView={publicView as ClosestPublicView} privateView={privateView as ClosestPrivateView} {...common} />
      ) : gameId === "whoami" ? (
        <WhoAmIView publicView={publicView as WhoAmIPublicView} privateView={privateView as WhoAmIPrivateView} {...common} />
      ) : gameId === "impostor" ? (
        <ImpostorView
          publicView={publicView as ImpostorPublicView}
          privateView={privateView as ImpostorPrivateView}
          youId={youId}
          local={local}
          {...common}
        />
      ) : gameId === "mas-o-menos" ? (
        <HigherLowerView publicView={publicView as HigherLowerPublicView} privateView={privateView as HigherLowerPrivateView} {...common} />
      ) : gameId === "espia" ? (
        <SpyView publicView={publicView as SpyPublicView} privateView={privateView as SpyPrivateView} youId={youId} {...common} />
      ) : gameId === "votacion" ? (
        <VoteView
          publicView={publicView as VotePublicView}
          privateView={privateView as VotePrivateView}
          youId={youId}
          local={local}
          {...common}
        />
      ) : gameId === "completa-frase" ? (
        <PhraseView
          publicView={publicView as PhrasePublicView}
          privateView={privateView as PhrasePrivateView}
          local={local}
          {...common}
        />
      ) : gameId === "mentira" ? (
        <LieView
          publicView={publicView as LiePublicView}
          privateView={privateView as LiePrivateView}
          local={local}
          {...common}
        />
      ) : gameId === "reflejos" ? (
        <ReflexView publicView={publicView as ReflexPublicView} privateView={privateView as ReflexPrivateView} {...common} />
      ) : gameId === "yo-nunca" ? (
        <NeverView publicView={publicView as NeverPublicView} privateView={privateView as NeverPrivateView} youId={youId} {...common} />
      ) : gameId === "tutti" ? (
        <StopView publicView={publicView as StopPublicView} privateView={privateView as StopPrivateView} {...common} />
      ) : gameId === "trivia" ? (
        <TriviaView publicView={publicView as TriviaPublicView} privateView={privateView as TriviaPrivateView} {...common} />
      ) : gameId === "cadena" ? (
        <ChainView publicView={publicView as ChainPublicView} privateView={privateView as ChainPrivateView} {...common} />
      ) : gameId === "emoji" ? (
        <EmojiView
          publicView={publicView as EmojiPublicView}
          privateView={privateView as EmojiPrivateView}
          local={local}
          {...common}
        />
      ) : gameId === "preferis" ? (
        <WouldView publicView={publicView as WouldPublicView} privateView={privateView as WouldPrivateView} {...common} />
      ) : (
        <p className="lead">Ese juego todavía está en el horno.</p>
      )}
    </div>
  );
}
