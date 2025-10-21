import logger from "@/utils/logger";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import poolPromise from "@/config/database";
import authRoutes from "@/routes/auth.route";
import googleRoutes from "@/routes/google.route";
import cookieParser from "cookie-parser";
import envConfig from "@/config/env";
// Import passport configuration
import "@/config/passport";
import passport from "passport";

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

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, async () => {
  // Test database connection on server start
  const pool = await poolPromise;
  if (!pool) throw new Error("Failed to connect to the database");
  const result = await pool.request().query("SELECT 1 AS number");
  console.log("Database query result:", result.recordset);
  // Log server start
  console.log(`Server listening on http://localhost:${PORT}`);
});
