import { Request, Response, NextFunction } from "express";
import { httpRequestDuration, httpRequestCounter } from "@/config/metrics";

/**
 * Helper function to normalize route paths
 *
 * Converts Express route paths into consistent format for metrics.
 * Examples:
 * - /api/users/123 -> /api/users/:id
 * - /api/mentors -> /api/mentors
 *
 * @param req Express request object
 * @returns Normalized route path
 */
function getRoutePath(req: Request): string {
  if (req.route) {
    const baseUrl = req.baseUrl || "";
    const routePath = req.route.path || "";
    return `${baseUrl}${routePath}`;
  }
  return req.path || req.url.split("?")[0] || "/";
}

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.path === "/metrics") {
    next();
    return;
  }

  // Start timing the request using high-resolution timer
  const start = process.hrtime();

  // Store the original end function
  const originalEnd = res.end;

  // Override res.end to capture metrics when response is sent
  res.end = function (
    this: Response,
    chunk?: unknown,
    encodingOrCallback?: BufferEncoding | (() => void),
    callback?: () => void
  ): Response {
    // Calculate duration in seconds
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    // Get route pattern for better metric grouping
    const route = getRoutePath(req);
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestDuration.labels(method, route, statusCode).observe(duration);
    httpRequestCounter.labels(method, route, statusCode).inc();

    // Call the original end function with proper typing
    if (typeof encodingOrCallback === "function") {
      return originalEnd.call(this, chunk, "utf8", encodingOrCallback);
    }
    if (encodingOrCallback !== undefined) {
      return originalEnd.call(this, chunk, encodingOrCallback, callback);
    }
    return originalEnd.call(this, chunk, "utf8");
  };

  next();
};
