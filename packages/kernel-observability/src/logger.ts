export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class PlatformLogger {
  log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context !== undefined ? { context } : {})
  };

  console.log(
    JSON.stringify(entry)
  );
}

  info(
    message: string,
    context?: Record<string, unknown>
  ): void {
    this.log("info", message, context);
  }

  error(
    message: string,
    context?: Record<string, unknown>
  ): void {
    this.log("error", message, context);
  }
}