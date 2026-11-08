import { PLAYERS } from "@/game/constants";
import { playerName } from "@/game/names";

import { PLAYER_TAG_CLASS } from "@/lib/tileStyles";

import type { Player } from "@/types/HexTile";
import type { PlayerInfo } from "@/types/Online";

type SideTilesProps = {
  self: PlayerInfo;
  opponent: PlayerInfo | null;
  onChoose: (side: Player | null) => void;
};

const SIDE_BAR_CLASS: Record<Player, string> = {
  1: "bg-player-1",
  2: "bg-player-2",
};

const describeStatus = (info: PlayerInfo): string => {
  if (!info.connected) return "Disconnected";
  return info.ready ? "Ready" : "Not ready";
};

export default function SideTiles({
  self,
  opponent,
  onChoose,
}: SideTilesProps) {
  return (
    <div role="group" aria-label="Your side" className="flex w-full gap-3">
      {PLAYERS.map((side) => {
        const isOwn = self.side === side;
        const holders = [
          { name: "You", info: self },
          { name: "Your friend", info: opponent },
        ].filter(
          (holder): holder is { name: string; info: PlayerInfo } =>
            holder.info !== null && holder.info.side === side,
        );
        const isHeld = holders.length > 0;

        return (
          <button
            key={side}
            type="button"
            aria-pressed={isOwn}
            disabled={self.ready}
            onClick={() => onChoose(isOwn ? null : side)}
            className={`flex h-36 flex-1 cursor-pointer flex-col items-center gap-2 rounded-md border-2 p-3 ring-2 ring-offset-2 ring-offset-background transition-[color,background-color,border-color,box-shadow] duration-300 ease-out disabled:cursor-not-allowed motion-reduce:transition-none ${
              isHeld
                ? `${PLAYER_TAG_CLASS[side]} border-transparent`
                : "border-border bg-surface text-muted-foreground"
            } ${isOwn ? "ring-foreground" : "ring-transparent"}`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-12 rounded-full transition-opacity duration-300 motion-reduce:transition-none ${SIDE_BAR_CLASS[side]} ${isHeld ? "opacity-0" : "opacity-100"}`}
            />
            <span className="font-semibold tracking-wide">
              {playerName(side).toUpperCase()}
            </span>
            <span className="relative w-full flex-1 text-sm">
              <span
                aria-hidden={isHeld}
                className={`absolute inset-x-0 top-0 text-center transition-opacity motion-reduce:transition-none ${isHeld ? "opacity-0 duration-100" : "opacity-100 delay-150 duration-200"}`}
              >
                Tap to pick
              </span>
              <span className="flex flex-col items-center gap-1.5">
                {holders.map(({ name, info }) => (
                  <span
                    key={name}
                    className="flex animate-[notice-pop_0.3s_ease-out_0.1s_backwards] flex-col items-center leading-tight motion-reduce:animate-none"
                  >
                    <span className="font-semibold">{name}</span>
                    <span className="text-xs">{describeStatus(info)}</span>
                  </span>
                ))}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
