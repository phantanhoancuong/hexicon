import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Tells whether the component has finished loading in the browser.
 *
 * Used to prevent mismatches between the server's render and the browser's first render.
 *
 * @returns `false` on the server and during the first render in the browser, then `true`.
 */
export const useMounted = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
