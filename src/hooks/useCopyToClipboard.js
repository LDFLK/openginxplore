import { useCallback, useEffect, useState } from "react";

/**
 * Hook to copy text to the clipboard and track the "copied" state.
 *
 * Centralizes the copy-to-clipboard logic that was previously duplicated
 * across CopyButton and ShareLinkButton, exposing a single reusable API
 * with consistent error handling and auto-reset behavior.
 *
 * @param {number} resetDelay - How long (ms) the `copied` flag stays true before resetting. Defaults to 2000ms.
 * @returns {{copied: boolean, copy: (text: string) => Promise<boolean>, reset: () => void}}
 */
export const useCopyToClipboard = (resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const reset = useCallback(() => {
    setCopied(false);
    setError(false);
  }, []);

  useEffect(() => {
    if (copied) {
      const timerId = setTimeout(() => {
        setCopied(false);
      }, resetDelay);

      return () => clearTimeout(timerId);
    }
  }, [copied, resetDelay]);

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(false);
        return true;
      } catch (err) {
        console.error("Failed to copy:", err);
        setCopied(false);
        setError(true);
        return false;
      }
    },
    []
  );

  return { copied, error, copy, reset };
};

export default useCopyToClipboard;
