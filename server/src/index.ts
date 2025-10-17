import express from "express";
const app = express();
const port = 3000;

// parse request to body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
