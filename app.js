if(process.env.NODE_ENV !="production"){
    require("dotenv").config()
}
const express = require("express");
const app = express();
let port = 3000;
app.listen(port,()=>{
    console.log("server started at port: ",port);
})

// ejs
const path = require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

// mongoose
const mongoose = require("mongoose");

const dbUrl = process.env.MONGO_DB;

const connectMongo = async()=>{
    await mongoose.connect(dbUrl);
}

connectMongo();
// method-override
var methodOverride = require('method-override') 
app.use(methodOverride('_method'))

// ejs mate
// user for layouts
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);

// routers
// to manage routes and increase code readability
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// server side validation
// const {listingSchema , reviewSchema } = require("./models/schemaValidation.js")

// models
const Listing = require("./models/listening");
const Review = require("./models/reviews.js");

// custom error handlers
const ExpressError = require("./utils/ExpressError.js");
// const wrapAsync = require("./utils/wrapAsync.js");

// cookie parse
const cookieParser = require("cookie-parser");
app.use(cookieParser(process.env.SECRET));

// express session
const session = require("express-session");
const MongoStore = require('connect-mongo');

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
      },
    //  if you don't want to resave all the session on database every single time that the user refreshes the page, you can lazy update the session, by limiting a period of time.
    touchAfter: 24*3600, // time period in seconds
})
app.use(session(
    {
        store, // same as store:store
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000, // the date is in miliseconds and will expire after 2 days of login
        }
    }
))

// connect-flash
const flash = require('connect-flash');
app.use(flash());

// passport authentication 
const passport = require("passport");
const LocalStatergy = require("passport-local");
const User = require("./models/user.js");

app.use(passport.initialize()); // initializing/starting the passport
app.use(passport.session()); // means save the session id from current user

passport.use(new LocalStatergy(User.authenticate())); // means to create a new Statergy for User schema

passport.serializeUser(User.serializeUser()); // means to save the user information when user logged in 
passport.deserializeUser(User.deserializeUser()); // means to unlogin the user when user left the website


// middleware 
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.searchQuery = req.query.q;
    next(); 
});
// home page

app.get("/demouser",async(req,res)=>{
    const fakeUser = new User({
        email: "fake@gmail.com",
        username: "fake_user"
    });
    let regUser = await User.register(fakeUser,"iamfakeuser");
    res.send(regUser);
})
app.get("/",(req,res)=>{
    // res.cookie("greet","hello");
    // res.cookie("name","Sparsh" , {signed: true});
        res.redirect("/listings");
})

app.get("/search", async (req, res) => {
    try {
      let query = req.query.q;
      query = query.trim().split(" ");
      const regex = new RegExp(query.join("|"), "i");
      const result = await Listing.find({
        $or:[
            {
                location: { $regex: regex }
            },
            {
                title: { $regex: regex }
            },
            {
                country: { $regex: regex }
            }
        ]
      });
  
      // Always send back a response
      res.json(result);  // <-- SEND the result, not await res.json()
    } catch (err) {
      console.error("Search Error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  
app.get("/find",async(req,res)=>{
    let query = req.query.q;
    let response = await Listing.findOne({title: query})
    res.json(response);
})
// app.get("/greet",(req,res)=>{
//     let {greet = "User"} = req.cookies;
//     console.log("Signed Cookies: ",req.signedCookies);
//     // console.log(`Signed Cookies: ${req.signedCookies}`)
//     console.log("Unsigned Cookies: ",req.cookies);
//     res.send(`Welcome ${greet}`);
//     // if signed cookie complete value is changed then we will receive empty object 
//     // if signed cookie only value is changed then we will receive key:false like: klfjSparshrdfsd to  klfjAryanrdfsd 
    
// })
// app.get("/session",(req,res)=>{
//     if(req.session.count){
//         req.session.count++;
//     }
//     else{
//         req.session.count = 1;
//     }
//     console.log(req.session.count);
//     res.send(`You have visited ${req.session.count} times`);
// })

// app.get("/register",(req,res)=>{
//     let {name = "anonymous"} = req.query;
//     req.session.name = name;
//     req.flash("registered","user registerd successfully");
//     res.redirect("/hello");

// })
// app.get("/hello",(req,res)=>{
//     res.locals.registered = req.flash("registered");
//     // res.send(`hello ${req.session.name}`)
//     let name = req.session.name;
//     res.render("temp",{name});
// })
// listing
app.use("/listings",listingsRouter);
// review 
app.use("/listings/:id/reviews",reviewsRouter);
app.use("",userRouter);


// error handler for invlaid route
app.all("*",(req,res,next)=>{
    next(new ExpressError(400,"Page not found"));
})
// error handler to handle all the possible mongoose errors
app.use((err,req,res,next)=>{
    let {status = 400, message = "Something went wrong"} = err;
    res.status(status).render("err",{err});
})
