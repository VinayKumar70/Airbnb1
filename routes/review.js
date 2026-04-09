const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controller/review.js")
const Review = require("../models/reviews.js");
const { validateReview,isLoggedIn, isReviewAuthor } = require("../middleware.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");





router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.addReview));

//delte Review route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview),
);

module.exports = router;