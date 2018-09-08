
const config = require('config');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const passport = require("passport");
const mongoose = require('mongoose');
const Traders = require("../models/trader");
let multer = require('multer');
const _ = require('lodash');
//let upload = multer();

var storage = multer.diskStorage({
  filename: function(req, file, callback){
      callback(null, Date.now() + file.originalname);
  }
});
/*
var image1 = function(req, file, callback){
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
      return callback(new Error("Only images allowed."), false);
  }
  callback(null, true);
};*/

var upload = multer({storage: storage});

  router.get('/', async (req, res) => {
    const numberOfTraders = await Traders.count();
    const traders = await Traders.find().sort('name');
    res.send(traders);
  });
  router.get('/new', async (req, res) => {
    res.render("users/new",  {err: ""});
  });
  router.get('/login', async (req, res) => {
    res.render("users/login");
  });
  router.get('/:id', async (req, res) => {
    const trader = await Traders.findById(req.params.id);//PARAMS NOT PARAM
    console.log(trader);
    if (!trader) {
      return res.status(404).send('The Trader with the given name was not found... Please Try again');
    }
    res.send(trader);
  });

  router.post('/new', upload.single("image"),  async (req, res) => {
    const { error } = validateTrader(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let trader = new Traders({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
      facebook: req.body.facebook,
    });
    try {
      trader = await trader.save();
    } catch(err) {
      if (err.toString().includes("email")) {
        res.render("users/new", {err: "Email already used"});
      } else {
        res.render("users/new", {err: err.toString()});
      }
    }
    res.render("users/profile", {trader: trader});
  });

  router.post("/login", passport.authenticate("local", 
    {   
        successRedirect: "../trades",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res) {
  });
  router.put('/:id', async (req, res) => {

    const { error } = validateTrader(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    const trader = await Traders.findByIdAndUpdate(req.params.id, {firstName: req.body.firstName, lastName: req.body.lastName, phone: req.body.phone, email: req.body.phone, facebook: req.body.facebook}, {new: true});
   
    if (!trader) {  
      return res.status(404).send("The Trader with the given ID was not found.");
    }
    res.send(trader);
  });
  
  router.delete('/:id', async (req, res) => {
    const trader = await Traders.findByIdAndRemove(req.params.id);
    if (!trader) return res.status(404).send('The Trader with the given ID was not found.');
  
    res.send(trader);
  });
  
    
  function validateTrader(trader) {
    const schema = {
      firstName: Joi.string().min(1).required(),
      lastName: Joi.string().min(1).required(),
      phone: Joi.string(),
      email: Joi.string().required(),
      password: Joi.string().required().min(8),
      facebook: Joi.string()
    };
  
    return Joi.validate(trader, schema);
  }

  module.exports = router;