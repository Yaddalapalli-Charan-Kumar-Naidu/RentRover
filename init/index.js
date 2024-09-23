const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

main().then(()=>{
    console.log("DB connection successful");
})
.catch((err)=>{
    console.log("Error in db connection");
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/rentrover");
}

const initDB= async()=>{
    await Listing.deleteMany({});
    initData.data =initData.data.map((obj)=>({...obj, owner:"66eacbde102d48e9c1d096b9"}));
    console.log(initData.data);
    await Listing.insertMany(initData.data)
    console.log("data was initialized");
}

initDB();