const Review = require("../models/reviews");
const Listing = require("../models/listening");

module.exports.postNewReview = async(req,res)=>{
    let review = new Review(req.body.review);
    review.owner = req.user._id;
    await review.save();
    let listing = await Listing.findById(req.params.id);
    listing.reviews.push(review);
    await listing.save();
    req.flash("success","Review Created Successfully!");
    res.redirect(`/listings/${req.params.id}`);
}

module.exports.destroyReview = async(req,res)=>{
    let {id,revId} = req.params;
     await Listing.findByIdAndUpdate(id, {$pull: {reviews: revId}});
     await Review.findByIdAndDelete(revId);
     req.flash("success","Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
}