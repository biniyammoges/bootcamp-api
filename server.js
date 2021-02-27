const express = require("express");
const colors = require("colors");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDb = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const fileupload = require("express-fileupload");

// Route files
const bootcamp = require("./routes/bootcamps");

// Load env vars
dotenv.config({ path: "./config/.env" });

// Database connection
connectDb();

const app = express();

// Body parser
app.use(express.json());

// Dev logging moddleware
process.env.NODE_ENV === "development" && app.use(morgan("dev"));

// File upload
app.use(fileupload());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routes
app.use("/api/v1/bootcamps", bootcamp);

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
