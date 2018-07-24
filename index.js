
const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const Joi = require('joi');
const logger = require('./middleware/logger');
const auth = require('./middleware/Authenticate');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const app = express();
const tradeTypesRouter = require('./routes/tradeTypes');
const homeRouter = require('./routes/home');
app.set('view engine', 'pug');
app.set('views', './views'); //all templates here

app.use(express.json());//built in middlewear
app.use(express.urlencoded({extended: true})); //key=value&key=value
app.use(express.static('public'));
app.use(logger);
app.use(auth);
app.use('/api/tradeTypes', tradeTypesRouter);
app.use('/', homeRouter);
app.use(helmet());//INSTALL MIDDLEWARE FUNCTION app.used is done everytime we get a request. Middleware populate req.body


if (app.get('env') === 'development') {//TO USE, set env='development'
  app.use(morgan('tiny'));
  startupDebugger("Morgan Enabled...");//to use, set DEBUG=app:* or DEBUG=app:startup
}

//Configuration with npm config
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server ' + config.get('mail.host'));
console.log('Mail PW: ' + config.get('mail.password'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));