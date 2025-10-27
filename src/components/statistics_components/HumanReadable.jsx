import { useCallback } from "react";

export function useHumanReadable() {
  return useCallback((text) => {
    return text
      .replace(/__/g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, []);
}
