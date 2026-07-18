import { useCallback, useEffect, useRef, useState } from "react";

export type SaveFeedbackStatus = "idle" | "saving" | "saved" | "error";

export function useSaveFeedback(onSave: () => void | Promise<void>) {
  const [status, setStatus] = useState<SaveFeedbackStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const save = useCallback(async () => {
    if (status === "saving") return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setStatus("saving");

    try {
      await onSave();
      setStatus("saved");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }

    resetTimer.current = setTimeout(() => setStatus("idle"), 1800);
  }, [onSave, status]);

  return { save, status };
}
