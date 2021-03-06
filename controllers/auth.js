const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

// @desc Register new user
// @route POST /api/v1/auth/register
// @access public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existUser = await User.findOne({ email });

  if (existUser) {
    return next(
      new ErrorResponse(
        `Email ${email} is already taken, please try another`,
        400
      )
    );
  }

  const user = await User.create({ name, email, password, role });

  //   Create token
  const token = await user.genToken();

  res.status(200).json({
    success: true,
    token,
  });
});

// @desc Login user
// @route POST /api/v1/auth/lgoin
// @access public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse(`Please provide email and password`, 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse(`Invalid email or password `, 404));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(`Invalid email or password `, 400));
  }

  res.status(200).json({
    success: true,
    data: user,
    token: await user.genToken(),
  });
});
