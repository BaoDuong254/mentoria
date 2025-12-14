import express, { Router, Request, Response } from "express";
import { register } from "@/config/metrics";
import { ipWhitelistMiddleware } from "@/middlewares/ipWhitelist.middleware";

const router: Router = express.Router();

router.get("/metrics", ipWhitelistMiddleware, async (req: Request, res: Response) => {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error("Error collecting metrics:", error);
    res.status(500).end("Error collecting metrics");
  }
});

export default router;
