var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');
var Campground = require('../models/campground');
var middleware = require("../middleware");

var upload = require('../middleware/multer');
var cloudinary = require("../middleware/cloudinary");

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
router.post("/register", upload.single('avatar'), async function (req, res) {
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            about: req.body.about
        });
    if(req.body.adminCode === "admin555"){
        newUser.isAdmin = true;
    }
    // Check for default avatar
    if(req.file){
        try{
            var result =  await cloudinary.v2.uploader.upload(req.file.path);
            newUser.avatar = result.secure_url;
            newUser.avatarId = result.public_id;
        } catch(err){
            req.flash('error', err.message);
            return res.redirect("back");
        }
    }else{
        newUser.avatar = "/avatar_placeholder.png";
    }
    User.register(newUser, req.body.password, function (err, item) {
        if(err){
            req.flash("error", err.message);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, function () {
            req.flash('success', "Welcome to YelpCamp " + item.username);
            res.redirect('/campgrounds');
        });
    });
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

router.get("/users/:id/edit", middleware.checkProfileOwnership, function(req, res){
    User.findById(req.params.id, function(err, item){
        if(err){
            res.redirect('/campgrounds');
        }else{
            res.render("users/edit", {user: item});
        }
    });
});

router.put("/users/:id", middleware.checkProfileOwnership, upload.single('avatar'), function(req, res){
    User.findById(req.params.id, async function (err, item) {
        if(err || !item){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            if(req.file){
                try{
                    await cloudinary.v2.uploader.destroy(item.avatarId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    item.avatarId = result.public_id;
                    item.avatar = result.secure_url;
                } catch (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
            }
            item.firstName = req.body.firstName;
            item.lastName = req.body.lastName;
            item.email = req.body.email;
            item.about = req.body.about;
            item.save();
            req.flash('success', 'Successfully Updated!');
            res.redirect('/users/'+ item._id);
        }
    });
});

router.delete("/users/:id", middleware.checkProfileOwnership, function(req, res){
    User.findById(req.params.id, async function(err, item){
        if(err){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        try{
            await cloudinary.v2.uploader.destroy(item.avatarId);
            item.remove();
            req.flash('success', "User deleted successfully!")
            res.redirect("/campgrounds");
        }catch(err){
            req.flash('error', err.message);
            return res.redirect('back');
        }
    });
});

module.exports = router;