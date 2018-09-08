
const config = require('config');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const Traders = require("../models/trader");
const mongoose = require('mongoose');
let multer = require('multer');

var storage = multer.diskStorage({
  filename: function(req, file, callback){
      callback(null, Date.now() + file.originalname);
  }
});


var upload = multer({storage: storage});

  router.get('/', async (req, res) => {
    res.render("users/DNE");
  });
  router.get('/new', async (req, res) => {
    res.render("users/new");
  });
  router.get('/:id', async (req, res) => {
    res.render("users/DNE");
  });
  

  router.post('/new', upload.single("image"), async (req, res) => {
    console.log(req.body);
    const { error } = validateTrader(req.body); 
    //if (error) return res.status(400).send(error.details[0].message + " bruh");

    
    let trader = new Traders({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
    });
    trader = await trader.save();
    res.render("users/profile", {trader: trader});
       
  });
  
  router.put('/:id', async (req, res) => {
    res.render("users/DNE");
  });
    
  function validateTrader(trade) {
    const schema = {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    };
  
    return Joi.validate(trade, schema);
  }

  module.exports = router;