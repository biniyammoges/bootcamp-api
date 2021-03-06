const express = require("express");
const {
  getBootcamps,
  getSingleBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middlewares/advancedResults");

// course router
const courseRouter = require("../routes/course");

const router = express.Router();

// Re-route to course router
router.use("/:bootcampId/courses", courseRouter);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(createBootcamp);

router.route("/:id/photo").put(uploadBootcampPhoto);

router
  .route("/:id")
  .get(getSingleBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
