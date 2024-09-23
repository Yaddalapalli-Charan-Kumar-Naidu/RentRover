const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
// const ExpressError=require("../utils/ExpressError.js");
// const {reviewSchema}=require("../schema.js");
const Review = require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReview,isLoggedIn, isReviewAuthor}=require("../middleware.js");
 
const reviewController =require("../controller/reviews.js");


//route for reveiws
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));


//delete review route
router.delete("/:reviewId",isReviewAuthor,wrapAsync(reviewController.destoryReview));


module.exports=router;