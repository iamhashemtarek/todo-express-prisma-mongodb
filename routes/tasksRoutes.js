const express = require("express");
const {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
  completed,
} = require("../controllers/tasksController");

const router = express.Router();

router.route("/").get(getAllTasks).post(createTask);
router.route("/:id").get(getTask).delete(deleteTask).patch(updateTask).post(completed);

module.exports = router;
