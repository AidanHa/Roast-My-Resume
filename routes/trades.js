
const config = require('config');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const tradeTypesEnum = [//array of categories
  'Others',
  'Clothing',
  'Shoes',
  'Bag',
  'Electronics',
  'Games',
  'Collectibles',
  'Rare items',
  'Sport gear',
  'Cash',
];

const tradeSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 3, maxlength: 30},
  type: {type: String, enum: tradeTypesEnum, required: true, minlength: 3, maxlength: 30},
  trader: {type: String, required: true, minlength: 3, maxlength: 30},
  date: { type: Date, default: Date.now}
});

const Trades = mongoose.model('trade', tradeSchema);//database w model


  router.get('/', async (req, res) => {
    const trades = await Trades.find().sort('name');
    res.send(trades);
  });

  router.get('/:id', async (req, res) => {
    const trade = await Trades.findById(req.params.id);//PARAMS NOT PARAM
    console.log(trade);
    if (!trade) {
      return res.status(404).send('The Trade Type with the given name was not found... Please Try again');
    }
    res.send(trade);
  });

  router.post('/', async (req, res) => {
    const { error } = validateTrade(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let trade = new Trades({
      name: req.body.name,
      type: req.body.type,
      trader: req.body.trader,
    });
    trade = await trade.save();
    res.send(trade);
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