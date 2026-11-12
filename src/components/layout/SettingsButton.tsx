"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { SettingsDialog } from "@/components/settings";

export default function SettingsButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname !== "/") return null;

  return (
    <>
      <button
        className="h-8 cursor-pointer rounded-md border border-border px-3 font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        SETTINGS
      </button>
      {open && <SettingsDialog onClose={() => setOpen(false)} />}
    </>
  );
}
