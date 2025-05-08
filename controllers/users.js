const User = require("../models/user");
module.exports.signUpPage = (req,res)=>{
    res.render("users/signup");
}
module.exports.postSignUp = async(req,res,next)=>{
    try{

        let{email,username,password} = req.body;
        let regUser = new User({
            email: email,
            username: username,
        })    
        await User.register(regUser,password);
        req.login(regUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","user registered successfully!");
            res.redirect("/listings");
        })
    }    
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }    
    // res.send("post working sexy!");
}
module.exports.getLoginPage = (req,res)=>{
    res.render("users/login");
}
module.exports.logout = (req,res,next)=>{
    // using locals here becuase whne req.logOut will run then req.session will be cleared
    res.locals.redirectUrl = req.session.redirectUrl;
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        // else it means user is logged out now
        req.flash("success","logout successfully");
        // to redirect to the previous path 
        if(res.locals.redirectUrl){
            res.redirect(res.locals.redirectUrl);
        }
        else{
            res.redirect("/listings");
        }
    })
}
module.exports.postLogin = async(req,res)=>{
    req.flash("success","logged in Successfully!");
    res.redirect(res.locals.redirectUrl);
}