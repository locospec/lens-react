import { useLensFormDebugClient } from "@lens2/contexts/lens-form-debug-context";
import { Badge } from "@lens2/shadcn/components/ui/badge";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lens2/shadcn/components/ui/card";
import { ScrollArea } from "@lens2/shadcn/components/ui/scroll-area";
import { Copy, Download, Trash2 } from "lucide-react";
import { useState } from "react";

export function LensFormDebugPanel() {
  const { logs, clearLogs } = useLensFormDebugClient();
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      case "debug":
        return "outline";
      default:
        return "default";
    }
  };

  const copyLogs = () => {
    const logText = logs
      .map(
        log =>
          `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}${log.data ? `\n${JSON.stringify(log.data, null, 2)}` : ""}`
      )
      .join("\n\n");

    navigator.clipboard.writeText(logText);
  };

  const downloadLogs = () => {
    const logText = logs
      .map(
        log =>
          `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}${log.data ? `\n${JSON.stringify(log.data, null, 2)}` : ""}`
      )
      .join("\n\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lens-form-debug-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Card className="max-h-96 w-96">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Form Debug Panel ({logs.length} logs)
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLogs}
                title="Copy logs"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadLogs}
                title="Download logs"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLogs}
                title="Clear logs"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className={`${isExpanded ? "h-64" : "h-32"}`}>
            <div className="space-y-2">
              {logs.slice(-20).map(log => (
                <div
                  key={log.id}
                  className="bg-muted/50 rounded border p-2 text-xs"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <Badge
                      variant={getLevelColor(log.level)}
                      className="text-xs"
                    >
                      {log.level}
                    </Badge>
                    <span className="text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-medium">{log.message}</div>
                  {log.data && (
                    <pre className="text-muted-foreground mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
