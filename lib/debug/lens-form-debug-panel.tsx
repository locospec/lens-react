import {
  useLensFormDebugClient,
  type DebugLog,
} from "@lens2/contexts/lens-form-debug-context";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  NonModalSheet,
  NonModalSheetContent,
} from "@lens2/shadcn/components/ui/non-modal-sheet";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lens2/shadcn/components/ui/sheet";
import { useEffect, useState } from "react";

// Helper functions
const getLogTitle = (log: DebugLog) => log.message;

const getLogSubtitle = (log: DebugLog) => {
  if (log.data) {
    // For logs, show a brief summary instead of full JSON
    if (typeof log.data === "string") return log.data;
    if (log.data.fieldPath) return `Field: ${log.data.fieldPath}`;
    if (log.data.error) return `Error: ${log.data.error}`;
    if (log.data.model) return `Model: ${log.data.model}`;
    return "View details →";
  }
  return "";
};

const getBadgeColor = (log: DebugLog) => {
  return log.level === "error"
    ? "bg-red-100 text-red-700"
    : log.level === "warn"
      ? "bg-yellow-100 text-yellow-700"
      : log.level === "debug"
        ? "bg-purple-100 text-purple-700"
        : "bg-blue-100 text-blue-700";
};

const formatTimestamp = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const InfoRow = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={className}>{value}</span>
  </div>
);

export function LensFormDebugPanel() {
  const { logs, clearLogs, recordsLoaded } = useLensFormDebugClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DebugLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (
      logs.length === 0 ||
      (selectedLog && !logs.find(l => l.id === selectedLog.id))
    ) {
      setSelectedLog(null);
      setIsDetailOpen(false);
    }
  }, [logs, selectedLog]);

  return (
    <>
      <NonModalSheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed right-4 bottom-4 z-50"
          >
            Debug ({logs.length})
          </Button>
        </SheetTrigger>
        <NonModalSheetContent
          className={`flex w-[400px] flex-col transition-all duration-300 sm:w-[540px] lg:top-1/2 lg:h-[96vh] lg:-translate-y-1/2 lg:rounded-md ${
            isDetailOpen ? "lg:right-[420px]" : "lg:right-[1vw]"
          }`}
        >
          <SheetHeader>
            <SheetTitle>LensForm Debug Panel</SheetTitle>
            <SheetDescription>
              View all logs and debug information from the LensForm component
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
            <div className="flex items-center justify-between py-4">
              <div className="text-muted-foreground flex gap-4 text-sm">
                <span>Logs: {logs.length}</span>
                <span>Records: {recordsLoaded}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearLogs}
                disabled={logs.length === 0}
              >
                Clear All
              </Button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {logs.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No logs yet
                </p>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className={`hover:bg-accent cursor-pointer space-y-1 overflow-hidden rounded-lg border p-3 text-sm transition-colors ${
                      selectedLog?.id === log.id ? "ring-primary ring-2" : ""
                    }`}
                    onClick={() => {
                      setSelectedLog(log);
                      setIsDetailOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${getBadgeColor(log)}`}
                          >
                            {log.level.toUpperCase()}
                          </span>
                          <span className="truncate">{getLogTitle(log)}</span>
                        </div>
                        <div className="text-muted-foreground text-xs break-all">
                          {getLogSubtitle(log)}
                        </div>
                      </div>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </NonModalSheetContent>
      </NonModalSheet>

      {selectedLog && (
        <NonModalSheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <NonModalSheetContent className="flex w-[400px] flex-col sm:w-[540px] lg:top-1/2 lg:right-[1vw] lg:h-[96vh] lg:-translate-y-1/2 lg:rounded-md">
            <SheetHeader>
              <SheetTitle>Log Details</SheetTitle>
              <SheetDescription>{getLogTitle(selectedLog)}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
              <div className="space-y-2 border-b py-4">
                <InfoRow
                  label="Level"
                  value={selectedLog.level.toUpperCase()}
                  className={`font-medium ${getBadgeColor(selectedLog).replace("bg-", "text-").replace("-100", "-600")}`}
                />
                <InfoRow
                  label="Time"
                  value={formatTimestamp(selectedLog.timestamp)}
                />
              </div>

              <div className="mt-4 flex-1 overflow-hidden">
                <div className="flex h-full flex-col">
                  <div className="bg-muted mb-4 rounded-md p-3">
                    <p className="text-sm">{selectedLog.message}</p>
                  </div>
                  {selectedLog.data && (
                    <>
                      <h3 className="mb-2 text-sm font-medium">Data</h3>
                      <pre className="bg-muted flex-1 overflow-auto rounded-md p-3 text-xs">
                        {JSON.stringify(selectedLog.data, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            </div>
          </NonModalSheetContent>
        </NonModalSheet>
      )}
    </>
  );
}
