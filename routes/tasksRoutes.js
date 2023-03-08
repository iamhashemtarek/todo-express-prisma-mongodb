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
  .get(protect, restrictTo("USER"), getAllTasks)
  .post(protect, restrictTo("USER"), createTask);
router
  .route("/:id")
  .get(protect, restrictTo("USER"), getTask)
  .delete(protect, restrictTo("USER"), deleteTask)
  .patch(protect, restrictTo("USER"), updateTask)
  .post(protect, restrictTo("USER"), completed);

module.exports = router;
