import { createLogger, transports, format } from "winston";
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] : ${message}`;
});

/**
 * Logger configuration using Winston
 *
 * @returns {Logger} Configured Winston logger
 *
 * @example
 * import logger from "@/utils/logger.js";
 * logger.info("This is an info message");
 */
const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "DD-MM-YYYY HH:mm:ss" }), colorize(), logFormat),
  transports: [new transports.Console()],
});

export default logger;
