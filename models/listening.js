const { default: mongoose } = require("mongoose");
const Review = require("./reviews");
const User = require("./user");
  
  let ListingSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: String,
    image:{
      url:String,
      filename: String,
    },
    // image:{
    //     type: String,
    //     // if no img field is inserted 
    //     default: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    //     // if feild is inserted but value is empty
    //     set: (v)=> v===""?"https://images.unsplash.com/photo-1542640244-7e672d6cef4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v
    // },
    price: Number,
    location:String,
    country: String,
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
      }
    ],
    owner:[
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
      },
    ],
      geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
  });
  // post middleware
  ListingSchema.post("findOneAndDelete",async(listing)=>{
    await Review.deleteMany({_id: {$in: listing.reviews}});
  })
  const Listing = mongoose.model("Listing",ListingSchema);

  module.exports = Listing;