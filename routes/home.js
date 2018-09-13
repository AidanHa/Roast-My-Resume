
const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.redirect('/api/Resumes');
  });

  module.exports = router;