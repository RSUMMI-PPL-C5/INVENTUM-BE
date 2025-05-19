/* istanbul ignore file */
import { Router } from "express";
import metricsService from "../services/metrics.service";

const router = Router();

// GET /metrics - Prometheus metrics endpoint
router.get("/", async (_req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    res.set("Content-Type", metricsService.contentType);
    res.end(metrics);
  } catch (error) {
    res.status(500).send("Error collecting metrics");
  }
});

export default router;
