import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import passport from "passport";
import User from "../models/user.js";

const userRouter = express.Router();

userRouter.get("/login",passport.authenticate('google', { scope: ["profile","email"] }));


userRouter.get("/auth/google/callback", passport.authenticate('google', { failureRedirect: '/login', failureFlash : true }),wrapAsync(async (req,res,next)=>{
    let user = await User.findOne({email : req.user._json.email});
    if(!user){
        user = new User({email: req.user._json.email, files: []});
        await user.save();
    }
    req.flash("success", "You are logged in!");
    res.redirect("/file");
}))

userRouter.get("/logout", (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logged Out Successfully!");
        res.redirect("/file");
    });
});

export default userRouter;