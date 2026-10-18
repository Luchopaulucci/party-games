"use client";

import { RoundTimer } from "@/components/RoundTimer";
import type { GameId } from "@/shared/types";
import { ClosestView } from "./ClosestView";
import { WhoAmIView } from "./WhoAmIView";
import { ImpostorView } from "./ImpostorView";
import { HigherLowerView } from "./HigherLowerView";
import { SpyView } from "./SpyView";
import { VoteView } from "./VoteView";
import { AuctionView } from "./AuctionView";
import { PhraseView } from "./PhraseView";
import { LieView } from "./LieView";
import { DrawView } from "./DrawView";
import { ReflexView } from "./ReflexView";
import { WaveView } from "./WaveView";
import { TabooView } from "./TabooView";
import { NeverView } from "./NeverView";
import { StopView } from "./StopView";
import { BombView } from "./BombView";
import { MimicView } from "./MimicView";
import type { ClosestPrivateView, ClosestPublicView } from "@/shared/games/closest/logic";
import type { WhoAmIPrivateView, WhoAmIPublicView } from "@/shared/games/whoami/logic";
import type { ImpostorPrivateView, ImpostorPublicView } from "@/shared/games/impostor/logic";
import type { HigherLowerPrivateView, HigherLowerPublicView } from "@/shared/games/higherlower/logic";
import type { SpyPrivateView, SpyPublicView } from "@/shared/games/spy/logic";
import type { VotePrivateView, VotePublicView } from "@/shared/games/vote/logic";
import type { AuctionPrivateView, AuctionPublicView } from "@/shared/games/auction/logic";
import type { PhrasePrivateView, PhrasePublicView } from "@/shared/games/phrase/logic";
import type { LiePrivateView, LiePublicView } from "@/shared/games/lie/logic";
import type { DrawPrivateView, DrawPublicView } from "@/shared/games/draw/logic";
import type { ReflexPrivateView, ReflexPublicView } from "@/shared/games/reflex/logic";
import type { WavePrivateView, WavePublicView } from "@/shared/games/wave/logic";
import type { TabooPrivateView, TabooPublicView } from "@/shared/games/taboo/logic";
import type { NeverPrivateView, NeverPublicView } from "@/shared/games/never/logic";
import type { StopPrivateView, StopPublicView } from "@/shared/games/stop/logic";
import type { BombPrivateView, BombPublicView } from "@/shared/games/bomb/logic";
import type { MimicPrivateView, MimicPublicView } from "@/shared/games/charades/logic";

export function ActiveGame({
  gameId,
  publicView,
  privateView,
  isHost,
  youId,
  players,
  onAction,
  timerSec,
}: {
  gameId: GameId;
  publicView: unknown;
  privateView: unknown;
  isHost: boolean;
  youId: string;
  players: { id: string; name: string; color?: string }[];
  onAction: (type: string, payload?: unknown) => void;
  timerSec?: number;
}) {
  const common = { isHost, players, onAction };
  return (
    <div className="stack">
      <RoundTimer seconds={timerSec} active onTimeout={() => onAction("timeout")} />
      {gameId === "closest" ? (
        <ClosestView publicView={publicView as ClosestPublicView} privateView={privateView as ClosestPrivateView} {...common} />
      ) : gameId === "whoami" ? (
        <WhoAmIView publicView={publicView as WhoAmIPublicView} privateView={privateView as WhoAmIPrivateView} {...common} />
      ) : gameId === "impostor" ? (
        <ImpostorView publicView={publicView as ImpostorPublicView} privateView={privateView as ImpostorPrivateView} youId={youId} {...common} />
      ) : gameId === "mas-o-menos" ? (
        <HigherLowerView publicView={publicView as HigherLowerPublicView} privateView={privateView as HigherLowerPrivateView} {...common} />
      ) : gameId === "espia" ? (
        <SpyView publicView={publicView as SpyPublicView} privateView={privateView as SpyPrivateView} youId={youId} {...common} />
      ) : gameId === "votacion" ? (
        <VoteView publicView={publicView as VotePublicView} privateView={privateView as VotePrivateView} youId={youId} {...common} />
      ) : gameId === "subasta" ? (
        <AuctionView publicView={publicView as AuctionPublicView} privateView={privateView as AuctionPrivateView} {...common} />
      ) : gameId === "completa-frase" ? (
        <PhraseView publicView={publicView as PhrasePublicView} privateView={privateView as PhrasePrivateView} {...common} />
      ) : gameId === "mentira" ? (
        <LieView publicView={publicView as LiePublicView} privateView={privateView as LiePrivateView} {...common} />
      ) : gameId === "dibuja" ? (
        <DrawView publicView={publicView as DrawPublicView} privateView={privateView as DrawPrivateView} youId={youId} {...common} />
      ) : gameId === "reflejos" ? (
        <ReflexView publicView={publicView as ReflexPublicView} privateView={privateView as ReflexPrivateView} {...common} />
      ) : gameId === "onda" ? (
        <WaveView publicView={publicView as WavePublicView} privateView={privateView as WavePrivateView} {...common} />
      ) : gameId === "taboo" ? (
        <TabooView publicView={publicView as TabooPublicView} privateView={privateView as TabooPrivateView} youId={youId} {...common} />
      ) : gameId === "yo-nunca" ? (
        <NeverView publicView={publicView as NeverPublicView} privateView={privateView as NeverPrivateView} youId={youId} {...common} />
      ) : gameId === "tutti" ? (
        <StopView publicView={publicView as StopPublicView} privateView={privateView as StopPrivateView} {...common} />
      ) : gameId === "bombita" ? (
        <BombView publicView={publicView as BombPublicView} privateView={privateView as BombPrivateView} youId={youId} {...common} />
      ) : gameId === "mimica" ? (
        <MimicView publicView={publicView as MimicPublicView} privateView={privateView as MimicPrivateView} youId={youId} {...common} />
      ) : (
        <p className="lead">Ese juego todavía está en el horno.</p>
      )}
    </div>
  );
}
