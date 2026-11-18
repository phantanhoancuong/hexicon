"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createRoom } from "@/lib/online/server";

import { Button } from "@/components/ui";

export default function CreateRoomButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const code = await createRoom();
      router.push(`/play/online/${code}`);
    } catch {
      setMessage("Could not reach the game server. Try again.");
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        className="w-full"
        onClick={handleCreate}
        disabled={creating}
      >
        {creating ? "CREATING..." : "CREATE ROOM"}
      </Button>
      <p role="alert" className="h-5 text-center text-sm">
        {message}
      </p>
    </div>
  );
}
