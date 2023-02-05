const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv").config({ path: "./config.env" });
const tasksRoutes = require("./routes/tasksRoutes");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

const app = express();

// middlewares
app.use(express.json());
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
//routes
app.use("/api/v1/tasks", tasksRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  procss.exit(1);
});
