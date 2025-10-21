import fs from "fs";
import path from "path";
import z from "zod";
import chalk from "chalk";
import { config } from "dotenv";

config({
  path: path.resolve(__dirname, "../../.env"),
});

const checkEnv = () => {
  if (!fs.existsSync(path.resolve(__dirname, "../../.env"))) {
    console.log(chalk.red("Can not find .env file!"));
    process.exit(1);
  }
};

checkEnv();

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_SERVER: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error(configServer.error.issues);
  throw new Error("Invalid environment variables");
}

const envConfig = configServer.data;

export default envConfig;
