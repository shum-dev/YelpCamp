var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');
var Campground = require('../models/campground');


// ROOT ROUT
router.get("/", function (req, res) {
    res.render("landing");
});

// ==========
// AUTHENTICATION ROUTS
// ==========

// REGISTER
// show register form
router.get("/register", function (req, res) {
    res.render('register');
});

// sign up logic
router.post("/register", function (req, res) {
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar,
            about: req.body.about
        });

    if(req.body.adminCode === "admin555"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function (err, item) {
        if(err){
            req.flash("error", err.message);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, function () {
            req.flash('success', "Welcome to YelpCamp " + item.username);
            res.redirect('/campgrounds');
        })
     })
});

// LOGIN
// show login form
router.get('/login', function (req, res) {
    res.render('login');
});

// handling login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome!"
}), function (req, res) {

});

// LOGOUT
router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect('/campgrounds');
});

// USER PROFILE
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Find by ID is failed");
            res.redirect('/');
        }
        Campground.find().where('author.id').equals(foundUser._id).exec(function(err, item) {
            if (err) {
                req.flash("error", "Find campgrounds by authorID is failed");
                res.redirect('/');
            }
            res.render("users/show", {user: foundUser, campgrounds: item});
        });
    });
});

module.exports = router;