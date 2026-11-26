import { useEffect } from "react";

import { useHelpSeen } from "@/lib/tutorialProgress";

/** Marks the help link as seen when the component mounts. */
export const useMarkHelpSeen = (): void => {
  const [, setHelpSeen] = useHelpSeen();

  useEffect(() => {
    setHelpSeen(true);
  }, [setHelpSeen]);
};
