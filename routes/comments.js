var express         = require("express");
var router          = express.Router({mergeParams: true});
var Campground      = require("../models/campground");
var Comment         = require("../models/comment");
var middleware      = require("../middleware");

// COMMENT CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    // find campground by id
    Campground.findById(req.params.id, function(err, item){
        if(err || !item){
            req.flash('err', "Are you fucking kidding me?");
            res.redirect('back');
        }else{
            res.render("comments/new", {campground: item});
        }
    });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
    // lookup campground using id
    Campground.findById(req.params.id, function (err, item_1) {
        if(err || !item_1){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            // create new comment
            Comment.create(req.body.comment, function(err, item_2){
                if(err){
                    req.flash("error", "Something went wrong with DB!");
                    console.log(err);
                }else{
                    item_2.author.id = req.user._id;
                    item_2.author.username = req.user.username;
                    item_2.campground = item_1._id;
                    item_2.save();
                    // connect new comment to campground
                    item_1.comments.push(item_2);
                    item_1.save();
                    // redirect
                    // res.redirect("/campgrounds/" + req.params.id);
                    req.flash("success", "Successfully added comment")
                    res.redirect("/campgrounds/" + item_1._id);
                }
            });

        }
    });
});

// COMMENT EDIT
router.get("/edit", middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.id, function(err, item){
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit", {comment: item});
        }
    });
});

// COMMENT UPDATE
router.put("/", middleware.checkCommentOwnership, function (req,res) {
    Comment.findOneAndUpdate({_id: req.params.id}, req.body.comment, function(err, item){
        if(err){
            res.redirect("back");
        }else{
            req.flash('success', "Successfully updated ")
            res.redirect("/campgrounds/" + item.campground);
        }
    });
});

// COMMENT DESTROY
router.delete("/", middleware.checkCommentOwnership, function(req, res){
    // find by ID and remove
    Comment.findByIdAndRemove(req.params.id, function(err, item){
        if(err){
            res.redirect('back');
        }else{
            req.flash("success", "Comment deleted")
            res.redirect('/campgrounds/' + item.campground);
        }
    });
});

module.exports = router;