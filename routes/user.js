const express = require("express");
const router = express.Router();
const {saveRedirectUrl,loginAuthen} = require("../middleware.js");
const userController = require("../controllers/users.js")


// opens signup form
// post signup 
router
.route("/signup")
.get(userController.signUpPage) 
.post(userController.postSignUp)  
router      

// get login form
// post login
router
.route("/login")
.get(userController.getLoginPage)    
.post(saveRedirectUrl,loginAuthen,userController.postLogin)

// logout user
router.get("/logout",userController.logout)

module.exports = router;