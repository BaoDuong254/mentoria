import fs from "fs";
import path from "path";
import z from "zod";
import chalk from "chalk";
import { config } from "dotenv";

const envPath = path.resolve(__dirname, "../../.env");

// Only load .env file if it exists (development mode)
// In production, Docker Compose injects env vars directly
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else if (process.env.NODE_ENV !== "production") {
  console.log(chalk.red("Can not find .env file!"));
  process.exit(1);
}

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_SERVER: z.string(),
  DB_NAME: z.string(),
  DB_INIT: z
    .string()
    .default("false")
    .transform((val) => val.toLowerCase() === "true"),
  JWT_SECRET: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_SEND: z
    .string()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLIC_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  METRICS_ALLOWED_IPS: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error(configServer.error.issues);
  throw new Error("Invalid environment variables");
}

const envConfig = configServer.data;

export default envConfig;
