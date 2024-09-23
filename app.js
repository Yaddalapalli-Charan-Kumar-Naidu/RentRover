if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}




const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const Listing=require("./models/listing.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review = require("./models/review.js");
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const session=require("express-session");
const MongoStore = require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy =require("passport-local");
const User =require("./models/user.js");
const userRouter=require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);





const dbUrl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("DB connection successful");
})
.catch((err)=>{
    console.log("-----***Error in db connection****-----");
});


async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in Mongo session Store",err);
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now() +7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());







// app.get("/",(req,res)=>{
//     res.send("WORKING");
// });


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});



app.get("/demouser",async(req,res)=>{
    let fakeUser=new User({
        email:"student@gmail.com",
        username:"fakeStudent"
    });
    let registeredUser=await User.register(fakeUser,"helloworld");
    res.send(registeredUser);
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);
// Copied to routes/listing.js
// //index route
// app.get("/listings",wrapAsync(async (req,res)=>{
//     const allListings=await Listing.find();
//     res.render("listings/index.ejs",{allListings});
// }));

// //new route
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// });


// //post route for new listings
// app.post("/listings",validateListing,wrapAsync(async (req,res)=>{
//     // let {title,description,image,price,location,country}=req.body;
//     // const newListing=new Listing({
//     //     title:title,
//     //     description:description,
//     //     image:image,
//     //     price:price,
//     //     location:location,
//     //     country:country,
//     // });
//     let newListing=new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// }));

// //get route for edit page
// app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     let listing=await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing});
// }));
// //put route for updating the edited values
// app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
//     if(!req.body.listing){
//         throw new ExpressError(400,"Send a valid data for listing");
//     }
//     let {id}=req.params;
//     // let newListing= new Listing(req.body.listing);
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));

// //show route
// app.get("/listings/:id",wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing});
// }));


// //Destroy route for listing
// app.delete("/listings/:id",wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings")
// }));

//copied to routes/review.js
// //route for reveiws
// app.post("/listings/:id/reviews",validateReview,wrapAsync( async (req,res)=>{
//     let {id}=req.params;
//     let listing=await Listing.findById(id);
//     let {rating,comment}=req.body.review;
//     // console.log(req.body);
//     // console.log(id,rating,comment);
//     let newReview=new Review({comment:comment,rating:rating,});
//     // console.log(newReview);
//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();
//     res.redirect(`/listings/${id}`);
// }));
// //delete review route
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync( async (req,res)=>{
//     let{id,reviewId}=req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));




// app.get("/testListing",async (req,res)=>{
//     let sampleListing= new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     })
//     await sampleListing.save();
//     console.log("sample was saved sucessfull");
//     res.send("sucessful testing");
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});
app.use((err,req,res,next)=>{
    // res.send("Something went wrong");
    let {statusCode=500,message="Something Went Wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});

const port=8080;
app.listen(port,()=>{
    console.log("app is running on port:",port);
});