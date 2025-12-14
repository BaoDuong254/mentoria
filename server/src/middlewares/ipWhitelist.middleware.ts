import { Request, Response, NextFunction } from "express";
import envConfig from "@/config/env";

export const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (envConfig.NODE_ENV === "development") {
    next();
    return;
  }

  const allowedIPsString = envConfig.METRICS_ALLOWED_IPS;

  if (!allowedIPsString || allowedIPsString.trim() === "") {
    console.error("METRICS_ALLOWED_IPS not configured in production - denying access");
    res.status(403).send("Forbidden: IP whitelist not configured");
    return;
  }

  // Parse allowed IPs
  const allowedIPs = allowedIPsString.split(",").map((ip) => ip.trim());

  // Get client IP (handle both IPv4 and IPv6 formats)
  const clientIP = req.ip || req.socket.remoteAddress || "";

  // Normalize IP - remove ::ffff: prefix for IPv6-mapped IPv4 addresses
  const normalizedClientIP = clientIP.replace("::ffff:", "");

  // Check if client IP is in whitelist
  const isAllowed = allowedIPs.some((allowedIP) => {
    return clientIP === allowedIP || normalizedClientIP === allowedIP;
  });

  if (!isAllowed) {
    console.warn(`Blocked access from: ${clientIP}`);
    res.status(403).send("Forbidden");
    return;
  }
  next();
};
