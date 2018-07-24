
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
    res.render('index', { title: 'Trending Trades', message: 'Hello!'});
  });

  module.exports = router;