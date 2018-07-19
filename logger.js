
function log(req, res, next) {//this sequence is called first
    console.log("logging...");
    next();    
}

module.exports = log; 
