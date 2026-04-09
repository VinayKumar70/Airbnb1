const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controller/listing.js")
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const {storage} = require("../cloudConfig.js");
const multer = require("multer");
const upload = multer({storage});

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));
//CREATE_ROUTE
router.get("/rent", isLoggedIn, listingController.renderRent);


router.route("/:id")
.get( wrapAsync(listingController.renderShow))
.put( isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.edit))
.delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEdit));

module.exports = router;
