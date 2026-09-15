require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;

const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const User = require("./models/user.js");

const dburl = process.env.ATLAS_URL;

main()
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => console.log("MongoDB Error:", err));

async function main() {
    await mongoose.connect(dburl);
}

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', engine);

// Body parsers & Static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Render HTTPS reverse proxy trust
app.set("trust proxy", 1);

// Mongo Session Store configuration
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600
});

store.on("error", (error) => {
    console.log("ERROR ON MONGO SESSION STORE:", error);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// 1. Session & Flash Middleware
app.use(session(sessionOptions));
app.use(flash());

// 2. Passport Authentication Middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 3. Global Variables Middleware (MUST BE BEFORE ROUTES)
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// 4. Routes
app.use("/listing", listingsRouter);
app.use("/listing/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// 404 Catch-All Route
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    if (statusCode === 500) {
        console.error("ACTUAL 500 BACKEND CRASH:", err);
    }
    res.status(statusCode).render("./listing/error.ejs", { message });
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
