var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const traderSchema = new mongoose.Schema({
    firstName: {type: String, required: true, minlength: 1, maxlength: 30},
    lastName: {type: String, required: true, minlength: 1, maxlength: 30},
    phone: {type: String},
    email: {type: String, minlength: 4, required: true, default: "none"},
    password: {type: String, minlength: 8, required: true, default: "none"},
    facebook: {type: String, minlength: 4, default: "none"},
  });
traderSchema.plugin(passportLocalMongoose);

const Traders = mongoose.model('traders', traderSchema);//database w model



module.exports = Traders;