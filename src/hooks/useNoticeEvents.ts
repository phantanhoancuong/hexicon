import { useEffect, useState } from "react";

import { NOTICE_MS } from "@/game/constants";

import { GameEvent } from "@/types/GameEvent";

export function useNoticeEvents() {
  const [events, setEvents] = useState<GameEvent[]>([]);

  useEffect(() => {
    if (events.length === 0) return;

    const timeout = setTimeout(() => setEvents([]), NOTICE_MS);
    return () => clearTimeout(timeout);
  }, [events]);

  return [events, setEvents] as const;
}
