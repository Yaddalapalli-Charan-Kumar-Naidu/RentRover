const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
// const ExpressError=require("../utils/ExpressError.js");
// const {listingSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing}=require("../middleware.js");

const listingController = require("../controller/listings.js");
const multer =require("multer");
const {storage}=require("../cloudConfig.js")
const upload = multer({storage});



router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));
    



//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destoryListing));




//index route
// router.get("/",wrapAsync(listingController.index));




//post route for new listings
// router.post("/",isLoggedIn,validateListing,wrapAsync(listingController.createListing));

//get route for edit page
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


//put route for updating the edited values
// router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing));

//show route
// router.get("/:id",wrapAsync(listingController.showListing));

//Destroy route for listing
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destoryListing));



module.exports= router;