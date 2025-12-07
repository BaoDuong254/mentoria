import z from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(5173),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_API_ENDPOINT: z.string().default(""),
});

const configServer = configSchema.safeParse(import.meta.env);

if (!configServer.success) {
  console.error(configServer.error.issues);
  throw new Error("Invalid environment variables");
}

const envConfig = configServer.data;

export default envConfig;
