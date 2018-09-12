const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = function (req, res, next) {//this sequence is called first
    console.log("Authenticating...");
    const token = req.header('x-auth-token');
    console.log(req.user);
    //console.log(req.isAuthenticated());
    if (!req.user) {
        res.render("users/login");
    } else {
        next();   
    }     
}
