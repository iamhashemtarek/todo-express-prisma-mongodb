const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv").config({ path: "./config.env" });
const tasksRoutes = require("./routes/tasksRoutes");
const usersRoutes = require("./routes/usersRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorsController");

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
app.use("/api/v1/users", usersRoutes);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `can not find this route ${req.originalUrl} on this server`,
      404
    )
  );
});
app.use(globalErrorHandler);

//start server
const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  procss.exit(1);
});
