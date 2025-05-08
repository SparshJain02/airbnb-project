const Listing = require("./models/listening");
const Review = require("./models/reviews");
const passport = require("passport");
const {listingSchema,reviewSchema } = require("./models/schemaValidation.js")
const ExpressError = require("./utils/ExpressError.js")




// this middleware is used for server side validation for the post requests 
module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el=> el.message).join(",")
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}
module.exports.validateReviews = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el=> el.message).join(",")
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

// this middleware checks the login credential with database and if the values don't match then it will redirect and flash a message 
module.exports.loginAuthen = passport.authenticate("local",
    { 
        failureRedirect: "/login",
        failureFlash: true,
    })
    
// this middleware is used to verify whether the user is logged in or not
module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){ 
        req.session.redirectUrl = req.originalUrl; // here we are saving the path from where we got the request before redirect and saving it to session
        req.flash("error","Please Login First");
        return res.redirect("/login");
    }
    next();
}


// this middleware is used to save the path from where we got the request and it will be used to redirect to this path when user will succesfully logged in 
module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){ 
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}   
module.exports.isActualUser = async (req,res,next) =>{
    let {id} = req.params;
    let list = await Listing.findById(id);
    if(!res.locals.currUser && list.owner[0]._id.equals(res.locals.currUser._id)){
        req.flash("error","Access Denied");
        return res.redirect(`/listings/${id}`)
    }
    next();
}
module.exports.isRevActualUser = async (req,res,next) =>{
    let {id,revId} = req.params;
    let review = await Review.findById(revId);
    console.log(review);
    if(!review.owner[0].equals(res.locals.currUser._id)){
        req.flash("error","You have not created this review");
        return res.redirect(`/listings/${id}`)
    }
    next();
}
