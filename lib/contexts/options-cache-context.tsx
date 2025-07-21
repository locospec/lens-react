import React, { createContext, useCallback, useContext, useRef } from "react";

interface OptionsCacheContextValue {
  getOption: (attribute: string, id: string) => string | undefined;
  setOption: (attribute: string, id: string, label: string) => void;
  setOptions: (
    attribute: string,
    options: Array<{ value: string; label: string }>
  ) => void;
  clearAttribute: (attribute: string) => void;
  clearAll: () => void;
}

const OptionsCacheContext = createContext<OptionsCacheContextValue | null>(
  null
);

export function OptionsCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use a ref to store the cache to avoid re-renders when cache updates
  // Map<attribute, Map<id, label>>
  const cacheRef = useRef<Map<string, Map<string, string>>>(new Map());

  const getOption = useCallback(
    (attribute: string, id: string): string | undefined => {
      return cacheRef.current.get(attribute)?.get(id);
    },
    []
  );

  const setOption = useCallback(
    (attribute: string, id: string, label: string) => {
      if (!cacheRef.current.has(attribute)) {
        cacheRef.current.set(attribute, new Map());
      }
      cacheRef.current.get(attribute)!.set(id, label);
    },
    []
  );

  const setOptions = useCallback(
    (attribute: string, options: Array<{ value: string; label: string }>) => {
      const attributeCache = new Map<string, string>();
      options.forEach(option => {
        attributeCache.set(option.value, option.label);
      });
      cacheRef.current.set(attribute, attributeCache);
    },
    []
  );

  const clearAttribute = useCallback((attribute: string) => {
    cacheRef.current.delete(attribute);
  }, []);

  const clearAll = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const value: OptionsCacheContextValue = {
    getOption,
    setOption,
    setOptions,
    clearAttribute,
    clearAll,
  };

  return (
    <OptionsCacheContext.Provider value={value}>
      {children}
    </OptionsCacheContext.Provider>
  );
}

export function useOptionsCache() {
  const context = useContext(OptionsCacheContext);
  if (!context) {
    throw new Error("useOptionsCache must be used within OptionsCacheProvider");
  }
  return context;
}
