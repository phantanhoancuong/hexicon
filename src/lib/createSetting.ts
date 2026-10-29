import { useSyncExternalStore } from "react";

const STORAGE_PREFIX = "hexicon:";

/**
 * Creates a hook for one setting that's saved in the browser.
 *
 * Any component that uses the hook sees the same value and re-renders when the value changes.
 *
 * Call `createSetting` once at the top of a file and NOT in a component.
 *
 * @param key - The name the setting is saved under in the browser's storage.
 * @param defaultValue - The value used until the player changes it, and whenever nothing valid is saved.
 * @param validate - If a value read from storage is acceptable. If the read value fails then it is ignored and `defaultValue` is used.
 * @returns A hook that returns the current value and a function to set the value.
 */
export const createSetting = <T>(
  key: string,
  defaultValue: T,
  validate: (value: unknown) => value is T,
) => {
  const listeners = new Set<() => void>();
  let currentValue = defaultValue;
  let loaded = false;

  /**
   * Registers a component to be told when the setting changes. React calls this when the component mounts.
   *
   * @param listener - The function to call on each change.
   * @returns A function that removes the listener. React calls it when the component unmounts.
   */
  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  /**
   * Fetches the setting's current value. Called on re-renders and changes.
   *
   * The first call loads the saved value from storage.
   * If there's nothing in storage, storage is blocked, or the saved value is not valid then the default value is returned.
   *
   * @returns The current value.
   */
  const getSnapshot = (): T => {
    if (!loaded) {
      loaded = true;
      try {
        const savedValue = localStorage.getItem(STORAGE_PREFIX + key);
        if (savedValue !== null) {
          const parsedValue: unknown = JSON.parse(savedValue);
          if (validate(parsedValue)) currentValue = parsedValue;
        }
      } catch {}
    }
    return currentValue;
  };

  /** Fetches the value to use on the server, during the first render in the browser (default value). */
  const getServerSnapshot = (): T => defaultValue;

  /**
   * Changes the setting, saves it into storage and tells subscribed components.
   *
   * @param next - The new value.
   */
  const setValue = (next: T): void => {
    currentValue = next;
    loaded = true;
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(next));
    } catch {}
    listeners.forEach((listener) => listener());
  };

  /**
   * A hook that connects a component to a setting, so the component re-renders when the value changes.
   *
   * @returns The current value and `setValue`, in the same shape as `useState`.
   */
  return function useSetting(): [T, (value: T) => void] {
    const value = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );
    return [value, setValue];
  };
};
