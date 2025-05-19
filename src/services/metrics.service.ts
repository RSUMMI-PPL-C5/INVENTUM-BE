/* istanbul ignore file */
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";
import prisma from "../configs/db.config";

class MetricsService {
  private registry: Registry;
  private httpRequestDurationMicroseconds: Histogram;
  private httpRequestCounter: Counter;
  private databaseConnectionGauge: Gauge;
  private activeUsersGauge: Gauge;
  private equipmentCount: Gauge;
  private requestsInProgress: Gauge;
  public contentType: string;

  constructor() {
    // Create a new registry
    this.registry = new Registry();
    this.contentType = this.registry.contentType;

    // Add default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register: this.registry });

    // HTTP request duration histogram
    this.httpRequestDurationMicroseconds = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.registry],
    });

    // HTTP request counter
    this.httpRequestCounter = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    // Database connection gauge
    this.databaseConnectionGauge = new Gauge({
      name: "database_connection_status",
      help: "Status of database connection",
      registers: [this.registry],
    });

    // Active users gauge
    this.activeUsersGauge = new Gauge({
      name: "active_users_count",
      help: "Number of active users in the system",
      registers: [this.registry],
    });

    // Equipment count gauge
    this.equipmentCount = new Gauge({
      name: "medical_equipment_count",
      help: "Number of medical equipment in the system",
      registers: [this.registry],
    });

    // In-progress requests gauge
    this.requestsInProgress = new Gauge({
      name: "requests_in_progress",
      help: "Number of service requests currently in progress",
      registers: [this.registry],
    });

    // Initialize metrics collection
    this.initMetricsCollection();
  }

  // Initialize periodic metrics collection
  private async initMetricsCollection() {
    // Check database connection every 60 seconds
    setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        this.databaseConnectionGauge.set(1); // Connected
      } catch (error) {
        this.databaseConnectionGauge.set(0); // Not connected
      }
    }, 60 * 1000);

    // Update equipment count every 5 minutes
    setInterval(
      async () => {
        try {
          const count = await prisma.medicalEquipment.count();
          this.equipmentCount.set(count);
        } catch (error) {
          // Silently fail, will retry next interval
        }
      },
      5 * 60 * 1000,
    );

    // Update active users count every 5 minutes
    setInterval(
      async () => {
        try {
          const count = await prisma.user.count({
            where: {
              deletedOn: null, // Count only non-deleted users
            },
          });
          this.activeUsersGauge.set(count);
        } catch (error) {
          // Silently fail, will retry next interval
        }
      },
      5 * 60 * 1000,
    );

    // Update in-progress requests count every 5 minutes
    setInterval(
      async () => {
        try {
          const count = await prisma.request.count({
            where: {
              status: {
                notIn: ["Success", "Failed"],
              },
            },
          });
          this.requestsInProgress.set(count);
        } catch (error) {
          // Silently fail, will retry next interval
        }
      },
      5 * 60 * 1000,
    );
  }

  // Record HTTP request metrics
  public recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestCounter.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
    this.httpRequestDurationMicroseconds.observe(
      { method, route, status_code: statusCode.toString() },
      duration,
    );
  }

  // Get metrics
  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}

// Export as singleton
export default new MetricsService();
