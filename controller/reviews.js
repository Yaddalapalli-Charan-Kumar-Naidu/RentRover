const Review = require("../models/review.js");
const Listing=require("../models/listing.js");


module.exports.createReview=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    let {rating,comment}=req.body.review;
    // console.log(req.body);
    // console.log(id,rating,comment);
    let newReview=new Review({comment:comment,rating:rating,});
    // console.log(newReview);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Added");
    res.redirect(`/listings/${id}`);
}

module.exports.destoryReview = async (req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
}