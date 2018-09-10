var mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const config = require('config');
//var passportLocalMongoose = require("passport-local-mongoose");

const traderSchema = new mongoose.Schema({
    firstName: {type: String, required: true, minlength: 1, maxlength: 30},
    lastName: {type: String, required: true, minlength: 1, maxlength: 30},
    email: {type: String, minlength: 4, required: true, default: "none"},
    password: {type: String, minlength: 8, required: true, default: "none"},
  });
//traderSchema.plugin(passportLocalMongoose);

traderSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({_id: this._id}, config.get('jwtPrivateKey'));
  return token;
};

const Traders = mongoose.model('traders', traderSchema);//database w model



module.exports = Traders;