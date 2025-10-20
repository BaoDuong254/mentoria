import logger from "@/utils/logger";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import poolPromise from "@/config/database";
const app = express();
const PORT = process.env.PORT || 3000;

// parse request to body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
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

app.get("/", (req, res) => {
  res.send("Hello world!");
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
