import fs from "fs";
import logger from "@/utils/logger";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import poolPromise from "@/config/database";
import authRoutes from "@/routes/auth.route";
import googleRoutes from "@/routes/google.route";
import mentorRoutes from "@/routes/mentor.route";
import menteeRoutes from "@/routes/mentee.route";
import userRoutes from "@/routes/user.route";
import searchRoutes from "@/routes/search.route";
import catalogRoutes from "@/routes/catalog.route";
import filterRoutes from "@/routes/filter.route";
import cookieParser from "cookie-parser";
import envConfig from "@/config/env";
import "@/config/passport";
import passport from "passport";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import path from "path";

const app = express();
const PORT = envConfig.PORT || 3000;

// parse request to body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// Initialize Passport (without session)
app.use(passport.initialize());

// enable CORS
app.use(
  cors({
    origin: envConfig.CLIENT_URL,
    credentials: true,
  })
);

// setup morgan with winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/mentees", menteeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/filter", filterRoutes);

// Health check endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running, welcome to Mentoria!",
  });
});

// Swagger API documentation
const file = fs.readFileSync(path.resolve(__dirname, "./openapi/bundle.yaml"), "utf8");
const swaggerDocument = YAML.parse(file);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, async () => {
  // Test database connection on server start
  const pool = await poolPromise;
  if (!pool) throw new Error("Failed to connect to the database");
  const result = await pool.request().query("SELECT 1 AS number");
  console.log("Database query result:", result.recordset);
  // Log server start
  console.log(`Server listening on http://localhost:${PORT}`);
});
