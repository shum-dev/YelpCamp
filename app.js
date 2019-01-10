require('dotenv').config();
var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require('passport'),
    LocalStrategy   = require('passport-local'),
    User            = require('./models/user'),
    // seedDB          = require("./seeds");
    methodOverride  = require("method-override"),
    flash           = require("connect-flash");

// console.log(process.env.DATABASE_URL);
var url = process.env.DATABASE_URL || "mongodb://localhost/yelp_camp_v21"
mongoose.connect(url, {useNewUrlParser: true});
// mongoose.connect("mongodb://localhost/yelp_camp_v21", {useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

// PASSPORT + SESSION CONFIG
app.use(require('express-session')({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Local variables
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Requring routes
var commentRouts    = require('./routes/comments'),
    campgroundRouts = require("./routes/campgrounds"),
    indexRoutes     = require("./routes");

// ROUTS INIT
app.use(indexRoutes);
app.use('/campgrounds/:id/comments', commentRouts);
app.use("/campgrounds", campgroundRouts);

app.listen(3000, function () {
    console.log("The YelpCamp Server Has Started!");
});