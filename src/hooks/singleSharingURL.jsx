import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

/**
 * Hook to synchronize a state variable with a URL search parameter.
 * Uses React Router's useSearchParams for cross-component synchronization.
 * 
 * @param {string} key - The search parameter key
 * @param {string} defaultValue - The default value if the parameter is missing
 * @returns {[string, Function]} - The current value and a setter function
 */
export default function useUrlParamState(key, defaultValue = '') {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback((newValue, options) => {
    const currentParams = new URLSearchParams(window.location.search);
    if (newValue !== '' && newValue != null) {
      currentParams.set(key, newValue);
    } else {
      currentParams.delete(key);
    }
    setSearchParams(currentParams, { replace: true, ...options });
  }, [key, setSearchParams]);

  return [value, setValue];
}
