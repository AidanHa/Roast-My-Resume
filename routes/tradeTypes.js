
const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const router = express.Router();

const tradeTypes = [//array of categories
    {id: 1, name: 'others'},
    {id: 2, name: 'clothing'},
    {id: 3, name: 'shoes'},
    {id: 4, name: 'bag'},
    {id: 5, name: 'electronics'},
    {id: 6, name: 'games'},
    {id: 7, name: 'collectibles'},
    {id: 8, name: 'rare items'},
    {id: 9, name: 'sport gear'},
    {id: 10, name: 'cash'},
];

  router.get('/', (req, res) => {
    res.send(tradeTypes);
  });

  router.get('/:id', (req, res) => {
    const tradeType = tradeTypes.find(c => c.id === parseInt(req.params.id));
    if (!tradeType) return res.status(404).send('The Trade Type with the given ID was not found.');
    res.send(tradeType);
  });

  router.post('/', (req, res) => {
    const { error } = validateTradeType(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    const tradeType = {
      id: tradeTypes.length + 1,
      name: req.body.name
    };
    tradeTypes.push(tradeType);
    res.send(tradeType);
  });
  
  router.put('/:id', (req, res) => {
    const tradeType = tradeTypes.find(c => c.id === parseInt(req.params.id));
    if (!tradeType) return res.status(404).send('The Trade Type with the given ID was not found.');
  
    const { error } = validateTradeType(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
    
    tradeType.name = req.body.name; 
    res.send(tradeType);
  });
  
  router.delete('/:id', (req, res) => {
    const tradeType = tradeTypes.find(c => c.id === parseInt(req.params.id));
    if (!tradeType) return res.status(404).send('The Trade Type with the given ID was not found.');
  
    const index = tradeTypes.indexOf(tradeType);
    tradeTypes.splice(index, 1);
  
    res.send(tradeType);
  });
    
  function validateTradeType(tradeType) {
    const schema = {
      name: Joi.string().min(3).required()
    };
  
    return Joi.validate(tradeType, schema);
  }

  module.exports = router;