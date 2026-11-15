"use client";

import { useEffect, useRef, useState } from "react";

import { SettingsDialog } from "@/components/settings";
import { Icon } from "@/components/ui";
import { gear } from "@/icons";

export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (wasOpen.current && !open) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        className="group -mr-1 flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Settings"
      >
        <Icon
          src={gear}
          className={`size-7 transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <SettingsDialog onClose={() => setOpen(false)} />}
    </>
  );
}
