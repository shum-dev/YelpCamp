var middlewareObject = {};
var Campground = require('../models/campground');
var Comment = require('../models/comment');

middlewareObject.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Campground.findOne({_id: req.params.id}, function (err, foundCampground) {
            if(err || !foundCampground){
                req.flash("error", "Campground not found ...");
                res.redirect("back");
            }else{
                // does user own the campground?
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that.")
                    res.redirect("back");
                }
             }
        });
    }else{
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back"); // redirect to previous page
    }
};

middlewareObject.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findOne({_id: req.params.id}, function (err, foundComment) {
            if(err || !foundComment){
                req.flash("error", "Comment not found ...");
                res.redirect("back");
            }else{
                // does user own the comment?
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that")
                    res.redirect("back");
                }

             }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back"); // redirect to previous page
    }
};

middlewareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect('/login');
};

module.exports = middlewareObject;