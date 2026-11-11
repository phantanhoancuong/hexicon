import { PLAYERS } from "@/game/constants";
import { playerName } from "@/game/names";

import type { Player } from "@/types/HexTile";
import type { PlayerInfo } from "@/types/Online";

type SeatsProps = {
  self: PlayerInfo;
  opponent: PlayerInfo | null;
  onChoose: (side: Player | null) => void;
};

const HEX_CLASS =
  "inline-block aspect-[1.1547] w-6 shrink-0 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]";

const SIDE_COLOR_CLASS: Record<Player, string> = {
  1: "bg-player-1",
  2: "bg-player-2",
};

const SIDE_PICKED_CLASS: Record<Player, string> = {
  1: "border-player-1 bg-player-1/15",
  2: "border-player-2 bg-player-2/15",
};

function SideHex({ side, dim = false }: { side: Player; dim?: boolean }) {
  return (
    <span
      aria-hidden
      className={`${HEX_CLASS} ${SIDE_COLOR_CLASS[side]} ${dim ? "opacity-60" : ""}`}
    />
  );
}

function Status({ info }: { info: PlayerInfo }) {
  if (info.ready)
    return (
      <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent">
        Ready
      </span>
    );
  return <span className="text-sm text-muted-foreground">Not ready</span>;
}

export default function Seats({ self, opponent, onChoose }: SeatsProps) {
  const seated = opponent !== null && opponent.connected ? opponent : null;

  return (
    <>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex min-h-7 items-center justify-between gap-3">
          <span className="font-semibold">You</span>
          <Status info={self} />
        </div>
        <div
          role="group"
          aria-label="Your side"
          className="grid grid-cols-2 gap-2"
        >
          {PLAYERS.map((side) => {
            const picked = self.side === side;
            return (
              <button
                key={side}
                type="button"
                aria-pressed={picked}
                disabled={self.ready}
                onClick={() => onChoose(picked ? null : side)}
                className={`flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-md border-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${
                  picked
                    ? `${SIDE_PICKED_CLASS[side]} text-foreground`
                    : "border-border text-muted-foreground"
                }`}
              >
                <SideHex side={side} dim={!picked} />
                {playerName(side)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <span
            className={`flex items-center gap-2 font-semibold ${seated === null ? "text-muted-foreground" : ""}`}
          >
            <span
              aria-hidden
              className={`size-2 rounded-full ${seated === null ? "bg-foreground/20" : "bg-accent"}`}
            />
            Opponent
          </span>
          <span className="flex min-h-5.25 items-center gap-2 text-sm text-muted-foreground">
            {seated === null ? (
              <>
                <span aria-hidden className={`${HEX_CLASS} bg-foreground/10`} />
                <span className="sr-only">Empty seat</span>
              </>
            ) : seated.side === null ? (
              "Choosing a side"
            ) : (
              <>
                <SideHex side={seated.side} />
                {playerName(seated.side)}
              </>
            )}
          </span>
        </div>
        {seated !== null && <Status info={seated} />}
      </div>
    </>
  );
}
