const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isActualUser,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js")


// multer to parse file
const multer = require("multer")
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})

//  listing page 
// post new list in database 
router
.route("/")
.get(wrapAsync(listingController.listingPage))
.post(upload.single("listing[image]"),validateListing,wrapAsync(listingController.postNewList))
// .post(upload.single("listing[image]"),(req,res)=>{
//     res.send(req.file);
// })

router
.route("/search")
.get(wrapAsync(listingController.searchListings))

// new listing page
router.get("/new",isLoggedIn,listingController.newListingPage)

// editing  listing  
router.get("/:id/edit",isLoggedIn,isActualUser,wrapAsync(listingController.getEditListForm))


// displaying particular list 
// delete listing
// put edit list 
router.route("/:id")
.get(wrapAsync(listingController.displayParticularPage))
.delete(isLoggedIn,isActualUser,wrapAsync(listingController.destroyListing))
.put(isLoggedIn,isActualUser,upload.single("listing[image]"),wrapAsync(listingController.putEditList))




module.exports = router;