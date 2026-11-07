import type { ReactNode } from "react";

export default function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}
