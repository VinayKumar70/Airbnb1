const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");


const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // ✅ Correct
const { response } = require("express");
const mapToken =  process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
console.log("MAP TOKEN:", mapToken);
module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});

    res.render("listing/index", { allListing });
};
module.exports.renderRent = async (req, res) => {
    res.render("listing/rent.ejs")
};
module.exports.createListing = async (req, res, next) => {
    console.log(">>> 1. ROUTE REACHED <<<");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

    // 1. Geocoding request
    let coordinate = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // 2. Safe image assignment
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { filename, url };
    }

    // 3. Safe geometry assignment (Prevents crash if location not found)
    if (coordinate.body.features && coordinate.body.features.length > 0) {
        newListing.geometry = coordinate.body.features[0].geometry;
    } else {
        newListing.geometry = {
            type: "Point",
            coordinates: [77.2090, 28.6139] // Default fallback (e.g. New Delhi)
        };
    }

    let saveListing = await newListing.save();
    console.log("Listing saved successfully:", saveListing._id);

    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
};

module.exports.renderShow = async (req, res) => { 
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid ID");
    }
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "listing does not exist");
        return res.redirect("/listing");
    };
    res.render("listing/show.ejs", { listing,mapToken: process.env.MAP_TOKEN });
};
module.exports.renderEdit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing does not exist");
        return res.redirect("/listing");
    };
    let originalimage = listing.image.url;
   originalimage = originalimage.replace("/upload","/upload/c_scale,h_300,w_250")
    res.render("listing/edit.ejs", { listing, originalimage });
};
module.exports.edit = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid ID");
    };
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }
    const { title, price, description, location, country } = req.body.listing;

    listing.title = title;
    listing.price = price;
    listing.description = description;
    listing.location = location;
    listing.country = country;

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { filename, url };
    }

    await listing.save();
    req.flash("success", "New Listing Updated!");
    res.redirect(`/listing/${id}`);
};
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, "Invalid ID");
    }


    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
};