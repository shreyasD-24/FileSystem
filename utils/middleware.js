export function isLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in!");
        return res.redirect("/file");
    }
    next();
};