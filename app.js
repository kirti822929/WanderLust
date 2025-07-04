if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js"); 
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo'); 

const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User= require("./models/user.js");
  

const dbUrl =  process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";



/*mongoose.connect(dbUrl);*/


const store= MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",(err)=>{
  console.log("ERROR in MONGO SESSION STORE",err);
});
const sessionOptions= {
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie: {
    expires: Date.now() + 7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly: true,
  },
};
//app.get("/",(req,res)=>{
  //res.send("i am root");
//S});



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const {listingSchema,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter= require("./routes/user.js");




main()
  .then(()=> {
    console.log("connected  to DB");

  })
  .catch((err)=> {
    console.log(err);
  });
async function main(){
    await mongoose.connect(dbUrl);
}
app.engine('ejs',ejsMate);
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));



const validateListing=(req,res,next) => {
  let {error} =listingSchema.validate(req.body);

  if(error) {
    let errMsg=error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
};

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser =req.user;
  next();
});

// app.get("/demouser",async(req,res)=>{
 // let fakeUser = new User({
 //   email:"student@gmail.com",
 //   username:"delta-student",
 // });

//  let registerdUser=await User.register(fakeUser,"helloworld");
//   res.send(registerdUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"}=err;
 // res.status(statusCode).send(message);
 res.status(statusCode).render("listings/error.ejs",{message});
});
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});