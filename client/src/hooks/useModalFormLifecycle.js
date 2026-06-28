import { useEffect, useRef } from "react";

/**
 * Locks body scroll and closes the modal on Escape.
 * Uses a ref for onClose so parent re-renders do not re-bind listeners.
 */
export function useModalBodyLock(open, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);
}

/**
 * Runs init once per modal session (open + sessionKey).
 * Skips re-init when the parent re-renders (e.g. after tab focus / auth revalidate).
 * Resets when the modal closes so the next open starts fresh.
 */
export function useModalFormInit(open, sessionKey, init) {
  const loadedRef = useRef(null);
  const initRef = useRef(init);
  initRef.current = init;

  useEffect(() => {
    if (!open) {
      loadedRef.current = null;
      return;
    }

    if (loadedRef.current === sessionKey) {
      return;
    }

    loadedRef.current = sessionKey;
    initRef.current();
  }, [open, sessionKey]);
}
