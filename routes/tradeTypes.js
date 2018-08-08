
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

const tradeTypeSchema = new mongoose.Schema({
  name: {type: String, enum: tradeTypesEnum, required: true, minlength: 1, maxlength: 30},
});

const TradeType = mongoose.model('Trade Types', tradeTypeSchema);//database w model


  router.get('/', async (req, res) => {
    const tradeTypes = await TradeType.find().sort('name');
    res.send(tradeTypes);
  });

  router.get('/:name', async (req, res) => {
    const tradeType = await TradeType.find({name: req.params.name});//PARAMS NOT PARAM
    console.log(tradeType);
    if (!tradeType) {
      return res.status(404).send('The Trade Type with the given name was not found... Please Try again');
    }
    res.send(tradeType);
  });

  router.post('/', async (req, res) => {
    const { error } = validateTradeType(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let tradeType = new TradeType({
      name: req.body.name
    });
    tradeType = await tradeType.save();
    res.send(tradeType);
  });
  
  router.put('/:id', async (req, res) => {

    const { error } = validateTradeType(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    const tradeType = await TradeType.findByIdAndUpdate(req.params.id, {name: req.body.name}, {new: true});
   
    if (!tradeType) {
      return res.status(404).send("The Trade Type with the given ID was not found.");
    }
    res.send(tradeType);
  });
  
  router.delete('/:id', async (req, res) => {
    const tradeType = await TradeType.findByIdAndRemove(req.params.id, {name: req.body.name}, {new: true});
    if (!tradeType) return res.status(404).send('The Trade Type with the given ID was not found.');
  
    res.send(tradeType);
  });
    
  function validateTradeType(tradeType) {
    const schema = {
      name: Joi.string().min(3).required()
    };
  
    return Joi.validate(tradeType, schema);
  }

  module.exports = router;