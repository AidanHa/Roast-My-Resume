
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const express = require('express');
const bcrypt = require('bcrypt');
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
  router.get('/login', async (req, res) => {
    res.render("users/login");
  });
  router.get('/:id', async (req, res) => {
    res.render("users/DNE");
  });
  

  router.post('/new', upload.single("image"), async (req, res) => {
    console.log(req.body);
    const { error } = validateTrader(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    let trader = await Traders.findOne({email: req.body.email});
    if (trader) return res.status(400).send('User already registered');
    trader = new Traders({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
    });
    const salt = await bcrypt.genSalt(10);
    trader.password = await bcrypt.hash(trader.password, salt);
    trader = await trader.save();
    const token = trader.generateAuthToken(); 
    console.log(token);
    res.header('x-auth-token', token).render("users/profile", {trader: trader});
       
  });
  router.post('/login', upload.single("image"), async (req, res) => {
    console.log(req.body);      
    //const { error } = validateTrader(req.body); 
   //if (error) return res.status(400).send(error.details[0].message);
    let trader = await Traders.findOne({email: req.body.email});
    if (!trader){
      return res.status(400).send('Email account not found');
    } else  {
      const validPass = await bcrypt.compare(req.body.password, trader.password);
      if (!validPass) {
        console.log(req.body.password);
        console.log(trader.password);
        return res.status(400).send('Wrong Password');
      } else {
        const token = trader.generateAuthToken(); 
        console.log("token: ");
        console.log(token);
        res.header('x-auth-token', token);
        res.render("users/profile", {trader: trader, token: token});
        
      }
    }      
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