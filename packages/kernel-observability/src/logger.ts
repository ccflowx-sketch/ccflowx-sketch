export class Logger {

  info(message: string, context?: Record<string, unknown>) {
    console.log({
      level: "info",
      message,
      context,
      timestamp: new Date().toISOString()
    });
  }

  error(message: string, context?: Record<string, unknown>) {
    console.error({
      level: "error",
      message,
      context,
      timestamp: new Date().toISOString()
    });
  }
}