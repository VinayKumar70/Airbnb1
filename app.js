 require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const User = require("./models/user.js");
const multer  = require('multer')
const dburl = process.env.ATLAS_URL;
main()                                                          //shows Exception
    .then((res) => {
        console.log("connectioin Successful");
    })
    .catch((err) => console.log(err));
// async function startServer() {
//     try {
//         await mongoose.connect(dburl);
//         console.log("✅ DB Connected");

//         app.listen(8080, () => {
//             console.log("🚀 Server running on port 8080");
//         });

//     } catch (err) {
//         console.log("❌ DB Error:", err);
//     }
// }

// startServer();

async function main() {
    await mongoose.connect(dburl);         //connect mongo to localhost with the help of asynchronous function

    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', engine);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

const store = MongoStore.create({
    crypto:{secret: process.env.SECRET},
    mongoUrl: dburl,
    touchAfter: 24*3600
     
});
store.on("error", (error) =>{
    console.log("ERROR ON MONGO SESSION STORE", error);
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

app.set("trust proxy", 1);

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });
// app.get("/demouser", async (req, res, next) => {
//     try {
//         let fakeUser = new User({
//             email: "student@gmail.com",
//             username: "its____bhushan" + Date.now(),
//         });

//         let registeredUser = await User.register(fakeUser, "helloWorld");
//         res.send(registeredUser);

//     } catch (err) {
//         console.log(err);
//         next(err);
//     }
// });
app.use("/listing", listingsRouter);
app.use("/listing/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// listing.save().then((res) => {
//     console.log("New Rent is uploded");
// }).catch((err) => {
//     console.log(err);
// });
// res.redirect("/listing");
// });


//Show Route

//review
//POst route


// app.get("/testlisting", async (req,res) => {
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "Near the Beach",
//         price : 1200,
//         location : "Calanguate, Goa",
//         country : "India"
//     });
//     await sampleListing.save();
//     console.log("Listing saved SUccessfully");
//     res.send("Successful");
// });


app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err); // Render logs me exact line print karega
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("./listing/error.ejs", { message });
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});