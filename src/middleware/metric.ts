import express from "express";
import * as promClient from "prom-client";

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory usage, etc.)
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const httpRequestCounter = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Database metrics
const dbQueryDurationMicroseconds = new promClient.Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "model"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);
register.registerMetric(dbQueryDurationMicroseconds);

export function setupMetrics(app: express.Application): void {
  // Expose metrics endpoint for Prometheus
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  });

  // Middleware to track request duration and count
  app.use((req, res, next) => {
    const start = Date.now();

    // Add response hook to capture metrics when the response is sent
    const originalSend = res.send;
    res.send = function (body): express.Response {
      const responseTime = Date.now() - start;
      const route = req.route?.path || req.path;

      // Record request duration
      httpRequestDurationMicroseconds
        .labels(req.method, route, res.statusCode.toString())
        .observe(responseTime / 1000); // Convert to seconds

      // Increment request counter
      httpRequestCounter
        .labels(req.method, route, res.statusCode.toString())
        .inc();

      return originalSend.call(this, body);
    };

    next();
  });

  // Add health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
}

// Utility function to measure database operations
export function measureDbOperation(
  operation: string,
  model: string,
  callback: () => Promise<any>,
): Promise<any> {
  const endTimer = dbQueryDurationMicroseconds
    .labels(operation, model)
    .startTimer();
  return callback().finally(() => endTimer());
}

// Export the registry and metrics for use elsewhere in the application
export {
  register,
  httpRequestDurationMicroseconds,
  httpRequestCounter,
  dbQueryDurationMicroseconds,
};
