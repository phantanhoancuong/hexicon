"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  /** `id` of the dialog's title. */
  labelledBy: string;
  /** `id` of the dialog's text. */
  describedBy?: string;
  /** Called when the player presses Escape or clicks outside the dialog to close. */
  onClose?: () => void;
  /** Layout of the content inside the dialog, such as `gap-5 text-center`. */
  /** Layout of dialog's content. */
  className?: string;
  children: ReactNode;
};

/** A modal dialog on top of the page. */
export default function Dialog({
  labelledBy,
  describedBy,
  onClose,
  className = "",
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      className="m-auto w-80 max-w-[calc(100vw-2.5rem)] bg-transparent p-0 text-foreground transition-opacity duration-300 backdrop:bg-black/70 backdrop:backdrop-blur-sm motion-reduce:transition-none starting:opacity-0"
    >
      <div
        className={`flex flex-col rounded-xl border border-border bg-surface p-6 ${className}`}
      >
        {children}
      </div>
    </dialog>
  );
}
