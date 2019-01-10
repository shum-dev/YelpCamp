var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// Add GeoCoder
var NodeGeocoder = require("node-geocoder");

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
var geocoder = NodeGeocoder(options);

// Add multer and cloudinary config
    //multer config
var multer = require('multer');
    // set storage engine
var storage = multer.diskStorage({   // set storage engine (when file uploaded it create custom name to this file)
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function(req, file, cb){
    // var filetypes = /\.(jpg|jpeg|png|gif)$/;
    var filetypes = /jpg|jpeg|png|gif/i;
    //accept image files only
    // if(!file.originalname.match(filetypes) && !file.originalname.match(filetypes)){
    if(!filetypes.test(file.originalname) && !filetypes.test(file.mimetype)){
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits:{fileSize: 6000000}
});

    //cloudinary config
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'egorshum',
    api_key: '244394558913856',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX - show all campgrounds
router.get("/", function (req, res) {
    //Get all campgrounds from DB
    Campground.find({}, function (err, item) {
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: item});
        }
    });

});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req,res) {
    res.render("campgrounds/new.ejs");
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req,res) {
    geocoder.geocode(req.body.campground.location, function(err, data){
        if(err || !data.length){
            req.flash('error', 'Invalid address');
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
    });

    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
        if(err){
            req.flash('error', err.message);
            return res.redirect("back");
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }

        //Create a new campground
        Campground.create(req.body.campground, function(err, newlyCreated){
                if(err){
                    req.flash("error", err.message);
                    return res.redirect('back');
                }
                res.redirect('/campgrounds/'+ newlyCreated.id);
        });
    });
});

//SHOW - show more info about particular campground
router.get("/:id", function (req,res) {
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function (err, item) {
                   // error handling +
        if(err || !item){
            req.flash("error", "Campground not found!");
            res.redirect("back");
        }else{
            //render show template with that campground
            res.render("campgrounds/show",{campground: item});
        }
    });
});

// EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, item) {
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.render("campgrounds/edit",{campground: item})
        }
    });
});

// UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function (req, res) {
    geocoder.geocode(req.body.camp.location, function(err, data){
        if(err || !data.length){
            req.flash('error', err.message);
            return res.redirect("back");
        }
        req.body.camp.lat = data[0].latitude;
        req.body.camp.lng = data[0].longitude;
        req.body.camp.location = data[0].formattedAddress;
    });
    Campground.findById(req.params.id, async function (err, item) {
        if(err){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            if(req.file){
                try {
                    await cloudinary.v2.uploader.destroy(item.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    item.imageId = result.public_id;
                    item.image = result.secure_url;
                } catch(err){
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
            }
            item.name = req.body.camp.name;
            item.description = req.body.camp.description;
            item.price = req.body.camp.price;
            item.lat = req.body.camp.lat;
            item.lng = req.body.camp.lng;
            item.location = req.body.camp.location;
            item.save();
            req.flash('success', 'Successfully Updated!');
            res.redirect('/campgrounds/'+ item._id);
        }
    });
 });

// DESTROY
router.delete('/:id', middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, async function (err, item) {
        if(err){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        try{
            await cloudinary.v2.uploader.destroy(item.imageId);
            item.remove();
            req.flash('success', "Campground deleted successfully!")
            res.redirect("/campgrounds");
        }catch(err){
            req.flash('error', err.message);
            return res.redirect('back');
        }
    });
});

module.exports = router;