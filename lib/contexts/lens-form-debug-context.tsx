import { createContext, use, useCallback, useMemo, useState } from "react";

export interface DebugLog {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: any;
}

export interface LensFormDebugClient {
  logs: DebugLog[];
  addLog: (
    message: string,
    data?: any,
    level?: "info" | "warn" | "error" | "debug"
  ) => void;
  clearLogs: () => void;
  setRecordsLoaded: (count: number) => void;
  recordsLoaded: number;
}

interface LensFormDebugContextValue {
  client: LensFormDebugClient;
  enabled: boolean;
}

const LensFormDebugContext = createContext<LensFormDebugContextValue | null>(
  null
);

export function LensFormDebugProvider({
  children,
  enabled = false,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [recordsLoaded, setRecordsLoaded] = useState(0);

  const addLog = useCallback(
    (
      message: string,
      data?: any,
      level: "info" | "warn" | "error" | "debug" = "info"
    ) => {
      if (!enabled) return;

      const log: DebugLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        level,
        message,
        data,
      };

      setLogs(prev => [...prev, log]);
    },
    [enabled]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const client = useMemo<LensFormDebugClient>(
    () => ({
      logs,
      addLog,
      clearLogs,
      setRecordsLoaded,
      recordsLoaded,
    }),
    [logs, addLog, clearLogs, recordsLoaded]
  );

  const contextValue = useMemo<LensFormDebugContextValue>(
    () => ({
      client,
      enabled,
    }),
    [client, enabled]
  );

  return (
    <LensFormDebugContext.Provider value={contextValue}>
      {children}
    </LensFormDebugContext.Provider>
  );
}

export const useLensFormDebugClient = () => {
  const context = use(LensFormDebugContext);
  if (!context) {
    // Return a no-op client if debug is not enabled
    return {
      logs: [],
      addLog: () => {},
      clearLogs: () => {},
      setRecordsLoaded: () => {},
      recordsLoaded: 0,
    };
  }
  return context.client;
};
