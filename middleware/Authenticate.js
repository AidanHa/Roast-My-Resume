
function auth(req, res, next) {//this sequence is called first
    console.log("Authenticating...");
    next();    
}

module.exports = auth; 