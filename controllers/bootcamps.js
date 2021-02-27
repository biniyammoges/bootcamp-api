const asyncHandler = require("../middlewares/asyncHandler");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // copy query obj
  let reqQuery = { ...req.query };

  // Fields to remove from query
  removeFields = ["select", "sort", "limit", "skip", "page"];

  // remove fields
  removeFields.forEach((params) => delete reqQuery[params]);

  // Change to string
  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|in|eq|nin|ne)\b/g,
    (match) => `$${match}`
  );

  query = Bootcamp.find(JSON.parse(queryStr));

  // select fiedls
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit) || 1;
  // const skip = parseInt(req.)

  // Executing query
  const bootcamps = await query.populate({
    path: "courses",
    select: "title description",
  });

  res.json({
    success: true,
    counts: bootcamps.length,
    bootcamps,
  });
});

// @desc Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access public
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  bootcamp
    ? res.status(200).json({
        success: true,
        bootcamp,
      })
    : next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
});

// @desc Create new bootcamp
// @route POST /api/v1/bootcamps
// @access admin/private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.json({
    success: true,
    bootcamp,
  });
});

// @desc Update bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access admin/private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  bootcamp
    ? res.json({
        success: true,
        bootcamp,
      })
    : next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
});

// @desc Delete bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access admin/private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  bootcamp.remove();

  res.json({
    success: true,
    data: {},
  });
});

// @desc Upload bootcamp photo
// @route PUT /api/v1/bootcamps/:id/photo
// @access admin/private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Check for file type
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload image file`, 400));
  }

  if (file.size > process.env.MAX_PHOTO_SIZE) {
    return next(new ErrorResponse(`FIle size too big`, 400));
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return new ErrorResponse(`problem with file upload`, 500);
    }
  });

  await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

  res.json({
    success: true,
    data: file.name,
  });
});
