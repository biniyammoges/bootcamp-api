const ErrorResponse = require("../utils/errorResponse");

const notFound = (req, res, next) => {
  next(
    new ErrorResponse(
      `Route not found - ${req.method} - ${req.originalUrl}`,
      404
    )
  );
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log for dev
  console.log(err);

  // Mongoose bad object
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server error",
  });
};

module.exports = { errorHandler, notFound };
