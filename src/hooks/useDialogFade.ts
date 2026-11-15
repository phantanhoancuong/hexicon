import { useCallback, useEffect, useRef, useState } from "react";

export const DIALOG_FADE_MS = 150;

export const useDialogFade = (
  onClose: () => void,
): { visible: boolean; requestClose: () => void } => {
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => onCloseRef.current(), DIALOG_FADE_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  const requestClose = useCallback(() => setClosing(true), []);

  return { visible: entered && !closing, requestClose };
};
