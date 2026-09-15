const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controller/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { storage } = require("../cloudConfig.js");
const multer = require("multer");
const upload = multer({ storage });

// 1. Index & Create Route
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    (req, res, next) => { console.log("STEP 1: isLoggedIn Passed"); next(); },
    upload.single("listing[image]"),
    (req, res, next) => { console.log("STEP 2: Multer/Cloudinary Upload Passed"); next(); },
    validateListing,
    (req, res, next) => { console.log("STEP 3: ValidateListing Passed"); next(); },
    wrapAsync(listingController.createListing)
  );

// 2. Form Route (HAMESHA :id SE PEHLE HONA CHAHIYE)
router.get("/rent", isLoggedIn, listingController.renderRent);

// 3. Show, Update & Delete Routes (:id HAMESHA AAKHRI ME)
router.route("/:id")
  .get(wrapAsync(listingController.renderShow))
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.edit))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// 4. Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEdit));

module.exports = router;
