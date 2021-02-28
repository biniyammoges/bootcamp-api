const fs = require("fs");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

// Load env
dotenv.config({ path: "./config/.env" });

connectDb();

// Load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

// read JSON file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

// Import data
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    // await Course.create(courses);
    console.log(`Data imported...`.green.inverse);
    process.exit(1);
  } catch (err) {
    console.log(`Error : ${err.message}`.red);
  }
};

// Delete data
const destroyData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();

    console.log(`Data destroyed...`.red.inverse);
    process.exit(1);
  } catch (err) {
    console.log(`Error : ${err.message}`.red);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
