// ******* when using restrictTo middleware write the roles in UPPERCASE*******
const express = require("express");
const {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
  completed,
} = require("../controllers/tasksController");
const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(protect, restrictTo("ADMIN"), getAllTasks) 
  .post(createTask);
router
  .route("/:id")
  .get(getTask)
  .delete(deleteTask)
  .patch(updateTask)
  .post(completed);

module.exports = router;
