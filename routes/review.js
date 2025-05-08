const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isRevActualUser, validateReviews} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js")

// new review
router.post("/", validateReviews, isLoggedIn ,wrapAsync(reviewController.postNewReview))

// review delete
router.delete("/:revId", isLoggedIn,isRevActualUser,wrapAsync(reviewController.destroyReview))
module.exports = router;