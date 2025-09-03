import React, {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";

export type DebugEntryType = "api" | "log";

export interface BaseDebugEntry {
  id: string;
  timestamp: Date;
  type: DebugEntryType;
}

export interface ApiCall extends BaseDebugEntry {
  type: "api";
  method: string;
  endpoint: string;
  request?: any;
  response?: any;
  status?: number;
  duration?: number;
}

export interface LogEntry extends BaseDebugEntry {
  type: "log";
  message: string;
  level?: "info" | "warn" | "error";
  data?: any;
}

export type DebugEntry = ApiCall | LogEntry;

interface LensViewDebugContextValue {
  entries: DebugEntry[];
  addApiCall: (call: Omit<ApiCall, "id" | "timestamp" | "type">) => string;
  updateApiCall: (id: string, updates: Partial<ApiCall>) => void;
  addLog: (
    message: string,
    data?: any,
    level?: "info" | "warn" | "error"
  ) => void;
  clearEntries: () => void;
  enabled: boolean;
  recordsLoaded: number;
  setRecordsLoaded: (count: number) => void;
}

const LensViewDebugContext = createContext<LensViewDebugContextValue | null>(
  null
);

interface LensViewDebugProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function LensViewDebugProvider({
  children,
  enabled = false,
}: LensViewDebugProviderProps) {
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [recordsLoaded, setRecordsLoaded] = useState(0);

  // Sort entries by timestamp whenever entries change
  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      ),
    [entries]
  );

  const addApiCall = useCallback(
    (call: Omit<ApiCall, "id" | "timestamp" | "type">) => {
      if (!enabled) return "";

      const id = Math.random().toString(36).substring(2, 11);
      const newCall: ApiCall = {
        ...call,
        id,
        timestamp: new Date(),
        type: "api",
      };

      setEntries(prev => [...prev, newCall]);
      return id;
    },
    [enabled]
  );

  const updateApiCall = useCallback(
    (id: string, updates: Partial<ApiCall>) => {
      if (!enabled) return;

      setEntries(prev =>
        prev.map(entry =>
          entry.type === "api" && entry.id === id
            ? ({ ...entry, ...updates } as ApiCall)
            : entry
        )
      );
    },
    [enabled]
  );

  const addLog = useCallback(
    (
      message: string,
      data?: any,
      level: "info" | "warn" | "error" = "info"
    ) => {
      if (!enabled) return;

      const id = Math.random().toString(36).substring(2, 11);
      const newLog: LogEntry = {
        id,
        timestamp: new Date(),
        type: "log",
        message,
        level,
        data,
      };

      setEntries(prev => [...prev, newLog]);
    },
    [enabled]
  );

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return (
    <LensViewDebugContext
      value={{
        entries: sortedEntries,
        addApiCall,
        updateApiCall,
        addLog,
        clearEntries,
        enabled,
        recordsLoaded,
        setRecordsLoaded,
      }}
    >
      {children}
    </LensViewDebugContext>
  );
}

export const useLensViewDebugClient = () => {
  const context = use(LensViewDebugContext);
  if (!context) {
    // Return a no-op client when not wrapped in provider
    return {
      entries: [],
      addApiCall: () => "",
      updateApiCall: () => {},
      addLog: () => {},
      clearEntries: () => {},
      enabled: false,
      recordsLoaded: 0,
      setRecordsLoaded: () => {},
    };
  }
  return context;
};
