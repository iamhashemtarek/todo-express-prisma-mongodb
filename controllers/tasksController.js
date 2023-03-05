const catchAsync = require("../utils/catchAsync");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createTask = catchAsync(async (req, res, next) => {
  const { name, description, category } = req.body;
  const task = await prisma.task.create({
    data: {
      name,
      description,
      category,
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
  const id = req.params.id;
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const tasks = await prisma.task.findMany();

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
  delete req.body.completed; // there is a seperate route to update the 'completed property
  data = req.body;
  const task = await prisma.task.update({
    where: {
      id,
    },
    data: data,
  });

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const task = await prisma.task.delete({
    where: {
      id,
    },
  });
  console.log(task);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.completed = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { completed } = req.body;
  const task = await prisma.task.update({
    where: {
      id,
    },
    data: {
      completed,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});
