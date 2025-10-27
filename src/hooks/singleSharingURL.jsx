import { useState, useEffect } from "react";

export default function useUrlParamState(key, defaultValue = '') {
  const [value, setValue] = useState(() => {
    const param = new URLSearchParams(window.location.search).get(key);
    return param ?? defaultValue;
  });

  // Update URL when state changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (value !== '' && value != null) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url.toString());
  }, [key, value]);

  // Update state on back/forward navigation
  useEffect(() => {
    const handler = () => {
      const param = new URLSearchParams(window.location.search).get(key);
      setValue(param ?? defaultValue);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [key, defaultValue]);

  return [value, setValue];
}
