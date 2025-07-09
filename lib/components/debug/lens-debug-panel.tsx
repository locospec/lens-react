import { useState, useEffect } from "react";
import { useLensDebugClient, type DebugEntry } from "@lens2/contexts/lens-debug-context";
import { NonModalSheet, NonModalSheetContent } from "@lens2/shadcn/components/ui/non-modal-sheet";
import { SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@lens2/shadcn/components/ui/sheet";
import { Button } from "@lens2/shadcn/components/ui/button";

// Helper functions
const getEntryTitle = (entry: DebugEntry) => 
  entry.type === 'api' ? `${entry.method} ${entry.endpoint.split("/").pop()}` : entry.message;

const getEntrySubtitle = (entry: DebugEntry) => {
  if (entry.type === 'api') return entry.endpoint;
  if (entry.type === 'log' && entry.data) {
    // For logs, show a brief summary instead of full JSON
    if (typeof entry.data === 'string') return entry.data;
    if (entry.data.viewName) return `View: ${entry.data.viewName}`;
    if (entry.data.error) return `Error: ${entry.data.error}`;
    return 'View details →';
  }
  return '';
};

const getBadgeColor = (entry: DebugEntry) => {
  if (entry.type === 'api') return 'bg-purple-100 text-purple-700';
  return entry.level === 'error' ? 'bg-red-100 text-red-700' :
         entry.level === 'warn' ? 'bg-yellow-100 text-yellow-700' :
         'bg-blue-100 text-blue-700';
};

const getStatusColor = (status?: number) => 
  status && status >= 200 && status < 300 ? "text-green-600" : "text-red-600";

const formatTimestamp = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const InfoRow = ({ label, value, className = "" }: { label: string; value: string | number; className?: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={className}>{value}</span>
  </div>
);

export function LensDebugPanel() {
  const { entries, clearEntries, recordsLoaded } = useLensDebugClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DebugEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "response">("request");

  useEffect(() => {
    if (entries.length === 0 || (selectedEntry && !entries.find(e => e.id === selectedEntry.id))) {
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
            className="fixed bottom-4 right-4 z-50"
          >
            Debug ({entries.length})
          </Button>
        </SheetTrigger>
        <NonModalSheetContent
          className={`w-[400px] sm:w-[540px] flex flex-col lg:h-[96vh] lg:top-1/2 lg:-translate-y-1/2 lg:rounded-md transition-all duration-300 ${
            isDetailOpen ? "lg:right-[420px]" : "lg:right-[1vw]"
          }`}
        >
          <SheetHeader>
            <SheetTitle>Lens Debug Panel</SheetTitle>
            <SheetDescription>
              View all API calls and logs from the Lens component
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground text-center py-8">
                  No entries yet
                </p>
              ) : (
                entries.map(entry => (
                  <div
                    key={entry.id}
                    className={`border rounded-lg p-3 space-y-1 text-sm overflow-hidden cursor-pointer hover:bg-accent transition-colors ${
                      selectedEntry?.id === entry.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => { setSelectedEntry(entry); setIsDetailOpen(true); }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="font-medium flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${getBadgeColor(entry)}`}>
                            {entry.type.toUpperCase()}
                          </span>
                          <span className="truncate">{getEntryTitle(entry)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground break-all">
                          {getEntrySubtitle(entry)}
                        </div>
                      </div>
                      {entry.type === 'api' && (
                        <div className="text-right flex-shrink-0">
                          {entry.status && (
                            <div className={`text-xs font-medium ${getStatusColor(entry.status)}`}>
                              {entry.status}
                            </div>
                          )}
                          {entry.duration && (
                            <div className="text-xs text-muted-foreground">{entry.duration}ms</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{formatTimestamp(entry.timestamp)}</span>
                      {entry.type === 'api' && entry.response?.data && Array.isArray(entry.response.data) && (
                        <span className="text-blue-600">• {entry.response.data.length} records</span>
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
          <NonModalSheetContent className="w-[400px] sm:w-[540px] flex flex-col lg:h-[96vh] lg:top-1/2 lg:-translate-y-1/2 lg:right-[1vw] lg:rounded-md">
            <SheetHeader>
              <SheetTitle>{selectedEntry.type === 'api' ? 'API Call' : 'Log'} Details</SheetTitle>
              <SheetDescription>{getEntryTitle(selectedEntry)}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
              <div className="py-4 space-y-2 border-b">
                {selectedEntry.type === 'api' ? (
                  <>
                    <InfoRow label="Status" value={selectedEntry.status || "N/A"} 
                      className={`font-medium ${getStatusColor(selectedEntry.status)}`} />
                    <InfoRow label="Duration" value={selectedEntry.duration ? `${selectedEntry.duration}ms` : "N/A"} />
                  </>
                ) : (
                  <InfoRow label="Level" value={selectedEntry.level?.toUpperCase() || 'INFO'}
                    className={`font-medium ${getBadgeColor(selectedEntry).replace('bg-', 'text-').replace('-100', '-600')}`} />
                )}
                <InfoRow label="Time" value={formatTimestamp(selectedEntry.timestamp)} />
              </div>

              <div className="flex-1 overflow-hidden mt-4">
                {selectedEntry.type === 'api' ? (
                  <div className="h-full flex flex-col">
                    <div className="flex gap-2 mb-4">
                      {['request', 'response'].map(tab => (
                        <Button
                          key={tab}
                          variant={activeTab === tab ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          disabled={tab === 'response' && !selectedEntry.response}
                          onClick={() => setActiveTab(tab as "request" | "response")}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <pre className="flex-1 overflow-auto rounded-md bg-muted p-3 text-xs">
                      {JSON.stringify(selectedEntry[activeTab] || {}, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="mb-4 p-3 rounded-md bg-muted">
                      <p className="text-sm">{selectedEntry.message}</p>
                    </div>
                    {selectedEntry.data && (
                      <>
                        <h3 className="text-sm font-medium mb-2">Data</h3>
                        <pre className="flex-1 overflow-auto rounded-md bg-muted p-3 text-xs">
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
