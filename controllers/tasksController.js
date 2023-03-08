const catchAsync = require("../utils/catchAsync");
const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/appError");
const prisma = new PrismaClient();

exports.createTask = catchAsync(async (req, res, next) => {
  const { name, description, category } = req.body;
  const userId = req.user.id;

  const task = await prisma.task.create({
    data: {
      name,
      description,
      category,
      user: {
        connect: { id: userId },
      },
    },
  });
  res.status(201).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const id = req.params.id; //task id
  const userId = req.user.id; //user id

  const task = await prisma.task.findFirst({
    // findFirst retuns null in case of zero objects
    where: {
      AND: [{ id }, { userId }],
    },
  });
  console.log(!task);

  if (!task) {
    return next(new AppError("not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const tasks = await prisma.task.findMany({
    where: {
      userId,
    },
  });

  res.status(200).json({
    status: "success",
    length: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id; //user id
  delete req.body.completed; // there is a seperate route to update the 'completed property
  data = req.body;

  const task = await prisma.task.updateMany({
    where: {
      AND: [{ id }, { userId }],
    },
    data: data,
  });

  if (!task.count) {
    return next(new AppError("not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id; //user id
  const task = await prisma.task.deleteMany({
    where: {
      AND: [{ id }, { userId }],
    },
  });

  if (!task.count) {
    return next(new AppError("not found!", 404));
  }
  console.log(task);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.completed = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id; //user id
  const { completed } = req.body;
  const task = await prisma.task.updateMany({
    where: {
      AND: [{ id }, { userId }],
    },
    data: {
      completed,
    },
  });

  if (!task.count) {
    return next(new AppError("not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});
