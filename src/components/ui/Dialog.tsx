"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useDialogFade } from "@/hooks/useDialogFade";

type DialogProps = {
  /** `id` of the dialog's title. */
  labelledBy: string;
  /** `id` of the dialog's text. */
  describedBy?: string;
  /** Called after the dialog has faded out completely, when the player presses Escape or clicks outside the dialog to close. */
  onClose?: () => void;
  /** Wide variant of dialog. */
  wide?: boolean;
  /** Layout of dialog's content. */
  className?: string;
  /** Dialog's content. */
  children: ReactNode | ((close: () => void) => ReactNode);
};

/** A modal dialog on top of the page. */
export default function Dialog({
  labelledBy,
  describedBy,
  onClose,
  wide = false,
  className = "",
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { visible, requestClose } = useDialogFade(() => onClose?.());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const dismiss = onClose && requestClose;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        event.preventDefault();
        dismiss?.();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss?.();
      }}
      className={`m-auto ${wide ? "w-96" : "w-80"} max-w-[calc(100vw-2.5rem)] bg-transparent p-0 text-foreground transition-opacity duration-150 backdrop:bg-black/70 backdrop:backdrop-blur-sm backdrop:transition-opacity backdrop:duration-150 motion-reduce:transition-none motion-reduce:backdrop:transition-none ${
        visible ? "" : "pointer-events-none opacity-0 backdrop:opacity-0"
      }`}
    >
      <div
        className={`flex flex-col rounded-xl border border-border bg-surface p-6 ${className}`}
      >
        {typeof children === "function" ? children(requestClose) : children}
      </div>
    </dialog>
  );
}
