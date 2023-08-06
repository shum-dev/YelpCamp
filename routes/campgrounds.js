var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

var upload = require("../middleware/multer");
var cloudinary = require("../middleware/cloudinary");

// Add GeoCoder
var NodeGeocoder = require("node-geocoder");
var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};
var geocoder = NodeGeocoder(options);

// INDEX
router.get("/", function (req, res) {
  var query = req.query.search || "";
  const regex = new RegExp(escapeRegex(query), "gi");
  Campground.find({ name: regex })
    .exec()
    .then((item) => {
      var noMatch;
      if (item.length < 1) {
        req.flash(
          "error",
          "No posts match that query, please try another one ..."
        );
        // noMatch = "No posts match that query, please try another one ...";
        res.render("campgrounds/index", {
          campgrounds: item,
          noMatch: noMatch,
          message: req.flash("error"),
        });
      } else {
        res.render("campgrounds/index", {
          campgrounds: item,
          noMatch: noMatch,
          message: req.flash("error"),
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// NEW
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new.ejs");
});

// CREATE
router.post(
  "/",
  middleware.isLoggedIn,
  upload.single("image"),
  function (req, res) {
    geocoder.geocode(req.body.campground.location, function (err, data) {
      if (err || !data.length) {
        console.log("error:", err);
        req.flash("error", "Invalid address");
        return res.redirect("back");
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;

      cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
          id: req.user._id,
          username: req.user.username,
        };
        Campground.create(req.body.campground)
          .then((newlyCreated) => {
            res.redirect("/campgrounds/" + newlyCreated.id);
          })
          .catch(() => {
            req.flash("error", err.message);
            return res.redirect("back");
          });
      });
    });
  }
);

//SHOW
router.get("/:id", function (req, res) {
  //find the campground with provided id
  Campground.findById(req.params.id)
    .populate("comments")
    .exec()
    .then((item) => {
      if (!item) {
        req.flash("error", "Campground not found!");
        res.redirect("back");
      } else {
        //render show template with that campground
        res.render("campgrounds/show", { campground: item });
      }
    })
    .catch((err) => {
      req.flash("error", "Campground not found!");
      res.redirect("back");
    });
});

// EDIT
router.get(
  "/:id/edit",
  middleware.checkCampgroundOwnership,
  function (req, res) {
    Campground.findById(req.params.id)
      .exec()
      .then((item) => {
        res.render("campgrounds/edit", { campground: item });
      })
      .catch(() => {
        res.redirect("/campgrounds");
      });
  }
);

// UPDATE
router.put(
  "/:id",
  middleware.checkCampgroundOwnership,
  upload.single("image"),
  function (req, res) {
    geocoder.geocode(req.body.camp.location, function (err, data) {
      if (err || !data.length) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      req.body.camp.lat = data[0].latitude;
      req.body.camp.lng = data[0].longitude;
      req.body.camp.location = data[0].formattedAddress;
    });
    Campground.findById(req.params.id)
      .exec()
      .then(async (item) => {
        if (req.file) {
          try {
            await cloudinary.v2.uploader.destroy(item.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            item.imageId = result.public_id;
            item.image = result.secure_url;
          } catch (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        item.name = req.body.camp.name;
        item.description = req.body.camp.description;
        item.price = req.body.camp.price;
        item.lat = req.body.camp.lat;
        item.lng = req.body.camp.lng;
        item.location = req.body.camp.location;
        item.save();
        req.flash("success", "Successfully Updated!");
        res.redirect("/campgrounds/" + item._id);
      })
      .catch(() => {
        req.flash("error", err.message);
        res.redirect("back");
      });
  }
);

// DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndRemove(req.params.id)
    .exec()
    .then(async (item) => {
      try {
        await cloudinary.v2.uploader.destroy(item.imageId);
        // item.remove();
        req.flash("success", "Campground deleted successfully!");
        res.redirect("/campgrounds");
      } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    })
    .catch((err) => {
      req.flash("error", err.message);
      return res.redirect("back");
    });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
