const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review = require("./review.js");

const listingSchema= new Schema({
    title:{
        type:String,
        required: true,
    },
    description:String,
    image: {
          url: String,
          filename:String,
      },
      
      
    
    price:Number,
    location:String,
    country:String,
   // category: {
    //    type: String,
   //     enum: ["Trending", "Room", "Iconic cities", "Mountains", "Castles", "Arctic", "Amazing Pool", "Farms", "Boats", "Domes"],
    //    required: true,
   // },
    reviews: [
        {
            type: Schema.Types.ObjectId,//obj id of review
            ref: "Review"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref : "User",
    },
 
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
    await Review.deleteMany({reviews: {$in: listing.reviews}});
    }
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;    

