const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//function to generate jwt token
function generateToken(id) {
  return jwt.sign({ id }, process.env.SECRET_STRING, {
    // ****payload have to be an object****
    expiresIn: process.env.MAX_AGE,
  });
}

// function to compare provided pass with the stored pass(hashed)
async function comparePass(plainPass, hashed) {
  return await bcryptjs.compare(plainPass, hashed); // retuen true/false
}

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  //hasing user password before storing it in the db
  const salt = await bcryptjs.genSalt();
  const hashedPass = await bcryptjs.hash(password, salt);
  //create a new user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPass,
    },
  });
  //jwt
  const token = generateToken(user.id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("please provide your correct email and password", 400) //400: bad request
    );
  }

  const user = await prisma.user.findUnique({
    // returns null if it found no user
    where: {
      email,
    },
  });

  if (!user || !(await comparePass(password, user.password))) {
    return next(new AppError("incorrect email or password", 401)); // 401 : un-auth
  }

  const token = generateToken(user.id);

  res.status(200).json({
    status: "success",
    token,
  });
});

// chech if the user logged in or not
exports.protect = catchAsync(async (req, res, next) => {
  // check if the token included in the http req headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // token sample: 'Bearer ...token....'
  }

  if (!token) {
    return next(
      new AppError("you are not logged-in, please login to get access", 401)
    );
  }

  // token verification
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_STRING); // make jwt.verify returns a promise

  //check if the user still exists
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });
  console.log(user);
  if (!user) {
    return next(
      new AppError("the user belongs to this token does no longer exists", 401)
    );
  }

  req.user = user; //will be used in restrictTo middleware
  next();
});

//authorization
// ******* when using restrictTo middleware write the roles in UPPERCASE*******
exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(new AppError("you do not have a permission", 403)); // 403: forbidden
    }

    next();
  };
};
