import express from "express";
import ejsMate from "ejs-mate";
import path from "path";
import {config} from "dotenv";
import indexRouter from "./routes/index.js";
import methodOverride from "method-override";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import flash from "connect-flash";
import ExpressError from "./utils/ExpressError.js";
    
const __dirname = dirname(fileURLToPath(import.meta.url));
if(process.env.NODE_ENV != "production"){
    config();
}

const GoogleStrategy = Strategy;

const app = express();

const store = MongoStore.create({
    mongoUrl : process.env.MONGODB_URL,
    touchAfter: 24*3600,
    crypto: {
      secret: process.env.SESSION_SECRET
    }
  });

const sessionOptions = {
    store,
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : { 
      expires : Date.now() + 2*24*60*60*1000,
      maxAge : 2*24*60*60*1000,
      httpOnly : true
    }
  };

app.engine('ejs', ejsMate);

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(session(sessionOptions));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/user/auth/google/callback"
}, async function(accessToken, refreshToken, profile, cb){
  cb(null, profile);
}));
passport.serializeUser((function(user, cb){
  cb(null,user);
}));
passport.deserializeUser((function(obj, cb){
  cb(null,obj);
}));

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get('/', (req, res) => {
    res.redirect('/file');
});

app.use("/", indexRouter);

app.all("*",(req,res,next) => {
    next(new ExpressError(404,"Page not Found"));
});

app.use((err,req,res,next)=>{
    let {status=500,name , message="Something went wrong"} = err;
    res.status(status).render("error.ejs",{message,name});
});

export default app;

