/* istanbul ignore file */
import { Request, Response, NextFunction } from "express";
import metricsService from "../services/metrics.service";

/**
 * Middleware to track HTTP request metrics
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function
  // @ts-ignore: 'this' implicitly has type 'any' because it does not have a type annotation
  res.end = function (chunk?: any, encoding?: any, cb?: any) {
    // Calculate request duration
    const responseTimeInMs = Date.now() - start;
    const responseTimeInSec = responseTimeInMs / 1000;

    // Record metrics
    const route = req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    metricsService.recordHttpRequest(
      method,
      route,
      statusCode,
      responseTimeInSec,
    );

    // Call original end function
    // @ts-ignore: Call is possibly missing arguments
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};
