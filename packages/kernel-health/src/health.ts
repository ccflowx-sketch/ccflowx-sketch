export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
}

export class HealthMonitor {
  check(): HealthStatus {
    return {
      status: "healthy",
      timestamp: new Date().toISOString()
    };
  }
}