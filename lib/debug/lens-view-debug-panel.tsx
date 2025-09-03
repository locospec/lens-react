import {
  useLensViewDebugClient,
  type DebugEntry,
} from "@lens2/contexts/lens-view-debug-context";
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
const getEntryTitle = (entry: DebugEntry) =>
  entry.type === "api"
    ? `${entry.method} ${entry.endpoint.split("/").pop()}`
    : entry.message;

const getEntrySubtitle = (entry: DebugEntry) => {
  if (entry.type === "api") return entry.endpoint;
  if (entry.type === "log" && entry.data) {
    // For logs, show a brief summary instead of full JSON
    if (typeof entry.data === "string") return entry.data;
    if (entry.data.viewName) return `View: ${entry.data.viewName}`;
    if (entry.data.error) return `Error: ${entry.data.error}`;
    return "View details →";
  }
  return "";
};

const getBadgeColor = (entry: DebugEntry) => {
  if (entry.type === "api") return "bg-purple-100 text-purple-700";
  return entry.level === "error"
    ? "bg-red-100 text-red-700"
    : entry.level === "warn"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-blue-100 text-blue-700";
};

const getStatusColor = (status?: number) =>
  status && status >= 200 && status < 300 ? "text-green-600" : "text-red-600";

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

export function LensViewDebugPanel() {
  const { entries, clearEntries, recordsLoaded } = useLensViewDebugClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DebugEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "response">("request");

  useEffect(() => {
    if (
      entries.length === 0 ||
      (selectedEntry && !entries.find(e => e.id === selectedEntry.id))
    ) {
      setSelectedEntry(null);
      setIsDetailOpen(false);
    }
  }, [entries, selectedEntry]);

  useEffect(() => setActiveTab("request"), [selectedEntry]);

  return (
    <>
      <NonModalSheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed right-4 bottom-4 z-50"
          >
            Debug ({entries.length})
          </Button>
        </SheetTrigger>
        <NonModalSheetContent
          className={`flex w-[400px] flex-col transition-all duration-300 sm:w-[540px] lg:top-1/2 lg:h-[96vh] lg:-translate-y-1/2 lg:rounded-md ${
            isDetailOpen ? "lg:right-[420px]" : "lg:right-[1vw]"
          }`}
        >
          <SheetHeader>
            <SheetTitle>LensView Debug Panel</SheetTitle>
            <SheetDescription>
              View all API calls and logs from the LensView component
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
            <div className="flex items-center justify-between py-4">
              <div className="text-muted-foreground flex gap-4 text-sm">
                <span>Entries: {entries.length}</span>
                <span>Records: {recordsLoaded}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearEntries}
                disabled={entries.length === 0}
              >
                Clear All
              </Button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {entries.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No entries yet
                </p>
              ) : (
                entries.map(entry => (
                  <div
                    key={entry.id}
                    className={`hover:bg-accent cursor-pointer space-y-1 overflow-hidden rounded-lg border p-3 text-sm transition-colors ${
                      selectedEntry?.id === entry.id
                        ? "ring-primary ring-2"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setIsDetailOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${getBadgeColor(entry)}`}
                          >
                            {entry.type.toUpperCase()}
                          </span>
                          <span className="truncate">
                            {getEntryTitle(entry)}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs break-all">
                          {getEntrySubtitle(entry)}
                        </div>
                      </div>
                      {entry.type === "api" && (
                        <div className="flex-shrink-0 text-right">
                          {entry.status && (
                            <div
                              className={`text-xs font-medium ${getStatusColor(entry.status)}`}
                            >
                              {entry.status}
                            </div>
                          )}
                          {entry.duration && (
                            <div className="text-muted-foreground text-xs">
                              {entry.duration}ms
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <span>{formatTimestamp(entry.timestamp)}</span>
                      {entry.type === "api" &&
                        entry.response?.data &&
                        Array.isArray(entry.response.data) && (
                          <span className="text-blue-600">
                            • {entry.response.data.length} records
                          </span>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </NonModalSheetContent>
      </NonModalSheet>

      {selectedEntry && (
        <NonModalSheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <NonModalSheetContent className="flex w-[400px] flex-col sm:w-[540px] lg:top-1/2 lg:right-[1vw] lg:h-[96vh] lg:-translate-y-1/2 lg:rounded-md">
            <SheetHeader>
              <SheetTitle>
                {selectedEntry.type === "api" ? "API Call" : "Log"} Details
              </SheetTitle>
              <SheetDescription>
                {getEntryTitle(selectedEntry)}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
              <div className="space-y-2 border-b py-4">
                {selectedEntry.type === "api" ? (
                  <>
                    <InfoRow
                      label="Status"
                      value={selectedEntry.status || "N/A"}
                      className={`font-medium ${getStatusColor(selectedEntry.status)}`}
                    />
                    <InfoRow
                      label="Duration"
                      value={
                        selectedEntry.duration
                          ? `${selectedEntry.duration}ms`
                          : "N/A"
                      }
                    />
                  </>
                ) : (
                  <InfoRow
                    label="Level"
                    value={selectedEntry.level?.toUpperCase() || "INFO"}
                    className={`font-medium ${getBadgeColor(selectedEntry).replace("bg-", "text-").replace("-100", "-600")}`}
                  />
                )}
                <InfoRow
                  label="Time"
                  value={formatTimestamp(selectedEntry.timestamp)}
                />
              </div>

              <div className="mt-4 flex-1 overflow-hidden">
                {selectedEntry.type === "api" ? (
                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex gap-2">
                      {["request", "response"].map(tab => (
                        <Button
                          key={tab}
                          variant={activeTab === tab ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          disabled={
                            tab === "response" && !selectedEntry.response
                          }
                          onClick={() =>
                            setActiveTab(tab as "request" | "response")
                          }
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <pre className="bg-muted flex-1 overflow-auto rounded-md p-3 text-xs">
                      {JSON.stringify(selectedEntry[activeTab] || {}, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <div className="bg-muted mb-4 rounded-md p-3">
                      <p className="text-sm">{selectedEntry.message}</p>
                    </div>
                    {selectedEntry.data && (
                      <>
                        <h3 className="mb-2 text-sm font-medium">Data</h3>
                        <pre className="bg-muted flex-1 overflow-auto rounded-md p-3 text-xs">
                          {JSON.stringify(selectedEntry.data, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </NonModalSheetContent>
        </NonModalSheet>
      )}
    </>
  );
}
