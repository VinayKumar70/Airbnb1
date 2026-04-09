const Listing = require("./models/listing");
const { listingSchema } = require("./schema.js");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/reviews.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.session.save(() => {
            return res.redirect("/login");
        });

    } else {
        next();
    }
};
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        // res.locals.redirectUrl(() => {
        //     return res.redirect(res.locals.redirectUrl);
        // })
        console.log("From session:", req.session.redirectUrl);
    }
    next();
};
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of it");
        return res.redirect(`/listing/${id}`);
    };
    next();

}
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listing/${id}`);
    };
    next();

}