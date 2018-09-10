
const config = require('config');
const auth = require("../middleware/Authenticate");
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const request = require('superagent');
let multer = require('multer');
//let upload = multer();
var cloudinary = require("cloudinary");

var storage = multer.diskStorage({
  filename: function(req, file, callback){
      callback(null, Date.now() + file.originalname);
  }
});

var image1 = function(req, file, callback){
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
      return callback(new Error("Only images allowed."), false);
  }
  callback(null, true);
};

var upload = multer({storage: storage, fileFilter: image1});


cloudinary.config({
    cloud_name: "trending-trades",
    api_key: "232591527462751",
    api_secret: "2Cxo217x3sbg8Vsj3IV-6nSbK5M"
});


const tradeTypesEnum = [//array of categories
  'Clothing',
  'Shoes',
  'Bag',
  'Electronics',
  'Games',
  'Collectibles',
  'Rare Items',
  'Sports Gear',
  'Cash',
  'Others',
];

const tradeSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 3, maxlength: 30},
  type: {type: String, enum: tradeTypesEnum, required: true, minlength: 3, maxlength: 30},
  trader: {type: String, required: true, minlength: 3, maxlength: 30},
  image: {type: String},
  desc: {type: String},
  date: { type: Date, default: Date.now}
});

const Trades = mongoose.model('trade', tradeSchema);//database w model


  router.get('/', async (req, res) => {

   // const token = req.header('x-auth-token');
    //console.log(token);

    const numberOfTrades = await Trades.count();
    var tradesArray = new Array(numberOfTrades); 
    const trades = await Trades.find((err, temp) => {
      for(var i = 0; i < temp.length; i++){
        tradesArray[i] = temp[i];
        console.log(temp[i].name);
        //console.log(numberOfTrades);
      }
      console.log(tradesArray);
      res.render("home/home", {trades: tradesArray});
    }).sort('name');
    
    //res.send(trades);
  });
  router.get('/new', auth, async (req, res) => {
      res.render("home/temp");
  });
  router.get('/:id', async (req, res) => {
    const trade = await Trades.findById(req.params.id);//PARAMS NOT PARAM
    console.log(trade);
    if (!trade) {
      return res.status(404).send('The Trade Type with the given name was not found... Please Try again');
    }
    //res.send(trade);
    res.render("item-page/item", {trade: trade});
  });
  

  router.post('/', auth, upload.single("image"), async (req, res) => {
    console.log(req.body);
    
    const { error } = validateTrade(req.body); 
    //if (error) return res.status(400).send(error.details[0].message + " bruh");
    if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });
    } else {
      cloudinary.uploader.upload(req.file.path, async (result) => {
        var temp = result.secure_url;
        console.log(image1);
        console.log('file received');  
        const host = req.host;
        const filePath = req.protocol + "://" + host + '/' + req.file.path;
       console.log(filePath);
        let trade = new Trades({
         name: req.body.name,
         type: req.body.type,
         trader: req.body.trader,
         desc: req.body.desc,
         image: temp
         
       });
      trade = await trade.save();
      res.render("item-page/item", {trade: trade});
      });   
      
    }
  });
  
  router.put('/:id', async (req, res) => {

    const { error } = validateTrade(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    const trade = await Trades.findByIdAndUpdate(req.params.id, {name: req.body.name, type: req.body.type, trader: req.body.trader}, {new: true});
   
    if (!trade) {
      return res.status(404).send("The Trade Type with the given ID was not found.");
    }
    res.send(trade);
  });
  
  router.delete('/:id', async (req, res) => {
    const trade = await Trade.findByIdAndRemove(req.params.id);
    if (!trade) return res.status(404).send('The Trade with the given ID was not found.');
  
    res.send(trade);
  });
    
  function validateTrade(trade) {
    const schema = {
      name: Joi.string().min(3).required(),
      type: Joi.string().min(3).required(),
      trader: Joi.string().min(3).required()
    };
  
    return Joi.validate(trade, schema);
  }

  module.exports = router;