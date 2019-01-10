var mongoose = require("mongoose");

// Schema
var commentSchema = new mongoose.Schema({
    text:String,
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    campground:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;