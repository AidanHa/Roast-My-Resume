const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = function (req, res, next) {//this sequence is called first
    console.log("Authenticating...");
    const token = req.header('x-auth-token');
    console.log(token);
    console.log(req.isAuthenticated());
    if (!token) {
        res.status(401).send("Access is denied, no token");
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.trader = decoded;
        next();    
    } catch (ex) {
        res.status(400).send('Invalid Token');
    }
    
}
