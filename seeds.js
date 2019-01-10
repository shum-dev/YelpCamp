var mongoose = require ("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment")

var data = [
    {
        name: "Cloud's Rest",
        image: "https://www.deepcreekcamping.com/images/Slides-camp-home/Tents-creek-3.jpg",
        description: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium " +
        "voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate " +
        "non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum " +
        "fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis " +
        "est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis " +
        "voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis" +
        " aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae." +
        " Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias" +
        " consequatur aut perferendis doloribus asperiores repellat."
    },
    {
        name: "Desert Maissa",
        image: "https://20dqe434dcuq54vwy1wai79h-wpengine.netdna-ssl.com/wp-content/uploads/2016/09/Moraine-Park-Campground-Tinkurlab-OutThere-Colorado-1024x684.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt" +
        " ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris " +
        "nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse " +
        "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa " +
        "qui officia deserunt mollit anim id est laborum."
    },
    {
        name: "Canyon Floor",
        image: "https://ridgelineimages.com/wp-content/uploads/2016/03/Sakatagaike-Park-Camping-Ground.jpg",
        description: "here are many variations of passages of Lorem Ipsum available, but the majority have" +
        " suffered alteration in some form, by injected humour, or randomised words which don't look even" +
        " slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there" +
        " isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the" +
        " Internet tend to repeat predefined chunks as necessary, making this the first true generator on" +
        " the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model" +
        " sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum" +
        " is therefore always free from repetition, injected humour, or non-characteristic words etc."
    }
];

function seedDB(){
    // remove all Campgrounds
    Campground.deleteMany({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("all removed!");
        data.forEach(function(seed){
            Campground.create(seed,function (err,item_1) {
                if(err){
                    console.log(err);
                }else{
                    console.log("added campgrounds");
                    // create a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there was internet",
                            author: "Homer"
                        },function(err, item_2){
                            if(err){
                                console.log(err);
                            }else{
                                item_1.comments.push(item_2);
                                item_1.save();
                                console.log("Created new comments");
                            }
                        });
                }
            });
         });
    });
}

module.exports = seedDB;