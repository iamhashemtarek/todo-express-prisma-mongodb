const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcryptjs = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function hashPassword(plainPassword) {
  const salt = await bcryptjs.genSalt();
  const hashedPassword = await bcryptjs.hash(plainPassword, salt);
  return hashedPassword;
}

exports.updateMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { name, email } = req.body;

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;

  await prisma.user.delete({
    where: {
      id,
    },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany();

  res.status(200).json({
    status: "success",
    length: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return next(new AppError("not found user!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.createAdminOrUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await prisma.user.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
