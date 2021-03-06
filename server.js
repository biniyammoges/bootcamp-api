const express = require("express");
const colors = require("colors");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDb = require("./config/db");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");

// Route files
const bootcampRouter = require("./routes/bootcamps");
const courseRouter = require("./routes/course");
const authRouter = require("./routes/auth");

// Load env vars
dotenv.config({ path: "./config/.env" });

// Database connection
connectDb();

const app = express();

// Body parser
app.use(express.json());
app.use(cookieParser());

// Dev logging moddleware
process.env.NODE_ENV === "development" && app.use(morgan("dev"));

// File upload
app.use(fileupload());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routes
app.use("/api/v1/bootcamps", bootcampRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/auth", authRouter);

// Error middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .underline.bold
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
