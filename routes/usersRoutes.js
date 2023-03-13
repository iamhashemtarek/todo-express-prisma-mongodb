const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require("../controllers/authController");
const {
  updateMe,
  deleteMe,
  getAllUsers,
  createAdminOrUser,
  updateUser,
  getUser,
  deleteUser,
} = require("../controllers/usersController");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);

router.use(protect);
router.post("/updatePassword/:id", updatePassword);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("ADMIN"));
router.route("/").get(getAllUsers).post(createAdminOrUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
