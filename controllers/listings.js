const Listing = require("../models/listening");

const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapApi = process.env.MAP_API;
const geocodingClient = mbxGeoCoding({ accessToken: mapApi});


module.exports.listingPage = async (req,res)=>{
    let allListings = await Listing.find();
    // console.log(allListings);    
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
    }
   res.render("listings/listings.ejs",{allListings});
}

module.exports.searchListings = async(req,res) =>{
    let query = req.query.q;
    res.locals.searchQuery = query;
    query = query.trim().split(" ");
    const regex = new RegExp(query.join("|"),"i");
    const allListings = await Listing.find({
        $or:[
            {title: {$regex: regex}},
            {location: {$regex: regex}},
            {country: {$regex: regex}},
        ]
    });
    if(!allListings.length>0){
        req.flash("error","no results found");
        res.locals.error = req.flash("error");
    }
    res.render("listings/listings.ejs",{allListings});
}


module.exports.newListingPage = (req,res)=>{
    res.render("listings/new_list.ejs");
}

module.exports.getEditListForm = async (req,res)=>{
    let {id} = req.params;
    let list = await Listing.findById(id);
    if(!list.owner[0]._id.equals(res.locals.currUser._id)){
        req.flash("error","Access Denied");
        return res.redirect(`/listings/${id}`)
    }
    else if(!list){
        // next(new ExpressError(401,"Id not found"));
        req.flash("error","Listing doesnot exist!");
    }
    let originalUrl = list.image.url;
    originalUrl = originalUrl.replace("/upload","/upload/h_100,w_150");
    res.locals.orignalUrl = originalUrl;
    res.render("listings/edit_list",{list});
}

module.exports.displayParticularPage = async (req,res)=>{
    // doing to redirect in case of logout
    // req.session.redirectUrl = req.originalUrl;    
    let {id} = req.params;
    let list = await Listing.findById(id).populate({
        path: "reviews",
        populate:{
            path: "owner"
        }
    }).populate("owner");
    // console.log(list);
    if(!list){
        req.flash("error","Listing doesnot exist!");
    }
    res.render("listings/details",{list});
}

module.exports.postNewList = async (req,res,next)=>{
    let {listing} = req.body;
    if(!listing){
        next(new ExpressError(400,"Please insert the data first!!!"));
    }

    // saving maps coordinates 
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
      .send()
    listing.geometry = response.body.features[0].geometry;

    // fetching url and filename 
    let {path:url,filename} = req.file;
    listing.image = {url,filename};

    listing.owner = req.user._id;
    await Listing.insertOne(listing,{runValidators: true})
    req.flash("success","New Listing Created!");
    res.redirect("/listings")
}

module.exports.putEditList = async (req,res,next)=>{
    let {id} = req.params;
    let newList = (req.body.listing);
    if(typeof req.file!="undefined"){
        let {filename,path:url} = req.file;
        newList.image = {filename,url};
    }

    if(newList.location){
        let response = await geocodingClient.forwardGeocode({
            query: newList.location,
            limit: 1
          })
          .send()
        newList.geometry = response.body.features[0].geometry;
    }

    await Listing.findByIdAndUpdate(id,newList)
    req.flash("success","Listing Edited Successfully!");
    res.redirect(`/listings/${id}`);
    
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted Successfully!");
    res.redirect("/listings");
}