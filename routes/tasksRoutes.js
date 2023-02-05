const express = require("express");
const tasksController = require("../controllers/tasksController");

const router = express.Router();

router.route("/").get(tasksController.getAllTasks).post();
router.route("/:id").get().post().patch();

module.exports = router;
