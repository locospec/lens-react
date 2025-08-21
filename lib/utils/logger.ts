/**
 * Simplified client-side logger for lens-react-2
 *
 * Usage:
 * 1. Enable logging: logger.enable()
 * 2. Set log level: logger.setLevel('DEBUG') // or 'INFO', 'WARN', 'ERROR'
 * 3. Use: logger.debug('message', data)
 *
 * You can also enable via browser console:
 * window.lensLogger.enable()
 * window.lensLogger.setLevel('DEBUG')
 */

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];
type LogLevelName = keyof typeof LogLevel;

// Global state
let isEnabled = false;
let currentLogLevel: LogLevelType = LogLevel.INFO;

// Colors for different log levels
const colors = {
  debug: "color: #888; font-weight: normal",
  info: "color: #2563eb; font-weight: bold",
  warn: "color: #f59e0b; font-weight: bold",
  error: "color: #ef4444; font-weight: bold",
};

function shouldLog(level: LogLevelType): boolean {
  return isEnabled && level >= currentLogLevel;
}

function formatMessage(level: string, message: string): string {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] [LENS-${level}] ${message}`;
}

export function debug(message: string, data?: any) {
  if (shouldLog(LogLevel.DEBUG)) {
    const formatted = formatMessage("DEBUG", message);
    console.log(`%c${formatted}`, colors.debug, data || "");
  }
}

export function info(message: string, data?: any) {
  if (shouldLog(LogLevel.INFO)) {
    const formatted = formatMessage("INFO", message);
    console.log(`%c${formatted}`, colors.info, data || "");
  }
}

export function warn(message: string, data?: any) {
  if (shouldLog(LogLevel.WARN)) {
    const formatted = formatMessage("WARN", message);
    console.warn(`%c${formatted}`, colors.warn, data || "");
  }
}

export function error(message: string, errorData?: any) {
  if (shouldLog(LogLevel.ERROR)) {
    const formatted = formatMessage("ERROR", message);
    const errorDetails =
      errorData instanceof Error
        ? { message: errorData.message, stack: errorData.stack }
        : errorData;
    console.error(`%c${formatted}`, colors.error, errorDetails || "");
  }
}

// Configuration functions
export function enable() {
  isEnabled = true;
  console.log(
    "%c[LENS-LOGGER] Logging enabled",
    "color: #10b981; font-weight: bold"
  );
}

export function disable() {
  isEnabled = false;
  console.log(
    "%c[LENS-LOGGER] Logging disabled",
    "color: #6b7280; font-weight: bold"
  );
}

export function setLevel(level: LogLevelName) {
  currentLogLevel = LogLevel[level];
  console.log(
    `%c[LENS-LOGGER] Log level set to ${level}`,
    "color: #10b981; font-weight: bold"
  );
}

export function getLevel(): LogLevelName {
  return Object.keys(LogLevel).find(
    key => LogLevel[key as LogLevelName] === currentLogLevel
  ) as LogLevelName;
}

export function isLoggerEnabled(): boolean {
  return isEnabled;
}

// Utility functions
export function group(label: string, fn: () => void) {
  if (isEnabled) {
    console.group(`%c${label}`, "color: #8b5cf6; font-weight: bold");
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  } else {
    fn();
  }
}

export function table(data: any) {
  if (isEnabled && console.table) {
    console.table(data);
  }
}

export function time(label: string): () => void {
  if (!isEnabled) {
    return () => {}; // No-op
  }

  console.time(`[LENS] ${label}`);
  return () => console.timeEnd(`[LENS] ${label}`);
}

// Expose to window for browser console access
if (typeof window !== "undefined") {
  (window as { lensLogger?: any }).lensLogger = {
    enable,
    disable,
    setLevel,
    getLevel,
    isEnabled: isLoggerEnabled,
    debug,
    info,
    warn,
    error,
  };
}
