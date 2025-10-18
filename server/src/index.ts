import logger from "@/utils/logger";
import express from "express";
import morgan from "morgan";
const app = express();
const port = 3000;

// parse request to body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
