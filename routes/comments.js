var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// COMMENT CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
  // find campground by id
  Campground.findById(req.params.id)
    .exec()
    .then((item) => {
      if (!item) throw "Error";
      res.render("comments/new", { campground: item });
    })
    .catch(() => {
      req.flash("err", "Are you f#@$ing kidding me?");
      res.redirect("back");
    });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
  // lookup campground using id
  Campground.findById(req.params.id)
    .exec()
    .then((item_1) => {
      if (!item_1) throw "Error";
      // create new comment
      Comment.create(req.body.comment)
        .then((item_2) => {
          item_2.author.id = req.user._id;
          item_2.author.username = req.user.username;
          item_2.campground = item_1._id;
          item_2.save();
          // connect new comment to campground
          item_1.comments.push(item_2);
          item_1.save();
          // redirect
          // res.redirect("/campgrounds/" + req.params.id);
          req.flash("success", "Successfully added comment");
          res.redirect("/campgrounds/" + item_1._id);
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", "Something went wrong with DB!");
        });
    })
    .catch((err) => {
      res.redirect("/campgrounds");
    });
});

// COMMENT EDIT
router.get("/edit", middleware.checkCommentOwnership, function (req, res) {
  Comment.findById(req.params.id)
    .exec()
    .then((item) => {
      res.render("comments/edit", { comment: item });
    })
    .catch((err) => {
      res.redirect("back");
    });
});

// COMMENT UPDATE
router.put("/", middleware.checkCommentOwnership, function (req, res) {
  Comment.findOneAndUpdate({ _id: req.params.id }, req.body.comment)
    .then((item) => {
      req.flash("success", "Successfully updated ");
      res.redirect("/campgrounds/" + item.campground);
    })
    .catch(() => {
      res.redirect("back");
    });
});

// COMMENT DESTROY
router.delete("/", middleware.checkCommentOwnership, function (req, res) {
  // find by ID and remove
  Comment.findByIdAndRemove(req.params.id)
    .exec()
    .then((item) => {
      req.flash("success", "Comment deleted");
      res.redirect("/campgrounds/" + item.campground);
    })
    .catch(() => {
      res.redirect("back");
    });
});

module.exports = router;
