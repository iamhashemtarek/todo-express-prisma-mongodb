const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { PrismaClient } = require("@prisma/client");
const sendEmail = require("../utils/sendEmail");
const prisma = new PrismaClient();

//function to generate jwt token
function generateToken(id) {
  return jwt.sign({ id }, process.env.SECRET_STRING, {
    // ****payload have to be an object****
    expiresIn: process.env.MAX_AGE,
  });
}

// function to compare posted password with the stored password(hashed)
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

//recives only user email
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return next(new AppError("there is no user with email address", 404));
  }

  //reset token generation
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetTokenExpires = Date.now() + 60 * 10 * 1000; //sec * min * 1000 (10 min)

  // store token in db
  await prisma.user.update({
    where: {
      email,
    },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: resetTokenExpires,
    },
  });

  //email configurations
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const subject = "you password reset token, vaid for 10 min";
  const message = `if you forgot your password, send a patch request with your new password to: ${resetUrl}, if you don't just ignore this email`;

  //sending email
  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    return next(
      new AppError("there was an error sending the email, try again later", 500)
    );
  }
});

//receive token (as a new password)
exports.resetPassword = catchAsync(async (req, res, next) => {
  //extract new password from req body and hashing it
  const { password } = req.body;
  const salt = await bcryptjs.genSalt();
  const hashedPass = await bcryptjs.hash(password, salt);

  //extract token from url
  const { resetToken } = req.params;
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //get user based on token
  console.log(hashedResetToken);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedResetToken,
    },
  });

  if (!user || Date.now() > user.passwordResetExpires) {
    return next(new AppError("token is invalid or has expired", 400));
  }

  // updating the password in the db
  await prisma.user.updateMany({
    where: {
      passwordResetToken: hashedResetToken,
    },
    data: {
      password: hashedPass,
    },
  });

  //jwt token generation
  const token = generateToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    message: "password updated successfuly",
  });
});
