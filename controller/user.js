const User = require("../models/user.js");
module.exports.renderSignup = (req, res) => {
    res.render("users/signup");
};
module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wonderlust");
            res.redirect("/listing");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};
module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};
module.exports.login = async (req, res) => {
    req.flash("success", "welcome back to wonderlust");
    let redirectUrl = res.locals.redirectUrl || "/listing"
    console.log("Final redirect:", res.locals.redirectUrl);
     res.redirect(redirectUrl);
};
module.exports.Logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You logged out");
        res.redirect("/listing");
    });

};