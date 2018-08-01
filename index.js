
const mongoose = require('mongoose');
const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');

const logger = require('./middleware/logger');
const auth = require('./middleware/Authenticate');
const tradeTypesRouter = require('./routes/tradeTypes');
const homeRouter = require('./routes/home');

const app = express();
app.set('view engine', 'pug');
app.set('views', './views'); //all templates here

app.use(express.json());//built in middlewear
app.use(express.urlencoded({extended: true})); //key=value&key=value
app.use(express.static('public'));
app.use(logger);//only called when there's a request bruh
app.use(auth);
app.use(helmet());//INSTALL MIDDLEWARE FUNCTION app.used is done everytime we get a request. Middleware populate req.body

if (app.get('env') === 'development') {//TO USE, set env='development'
  app.use(morgan('tiny'));
  startupDebugger("Morgan Enabled...");//to use, set DEBUG=app:* or DEBUG=app:startup
}

app.use('/api/tradeTypes', tradeTypesRouter);
app.use('/', homeRouter);

const tradesSchema = new mongoose.Schema({
  name: String,
  category: String,
  seller: String,
  price: Number,
  date: { type: Date, default: Date.now},

});

//Configuration with npm config
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server ' + config.get('mail.host'));
console.log('Mail PW: ' + config.get('mail.password')); //set password="password"

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

mongoose.connect('mongodb://localhost/playground').then(() => console.log('Connected to database')).catch((err) => console.error('Could not connect to mongodb', err));

const Trades = mongoose.model('tradeTypes', tradesSchema);
/*
async function createTrade() {
  
  const trades = new Trades({
    name: "League of Legends Poster",
    category: "Others",
    seller: "Aidan",
    price: 35,
  });
  const result = await trades.save();
  console.log(result);
}
*/
/*
async function createTrade() {
  const Trades = mongoose.model('tradeTypes', tradesSchema);
  const trades = new Trades({
    name: "Sony Earbuds",
    category: "Electronics",
    seller: "Jonathan",
    price: 20,
  });
  const result = await trades.save();
  console.log(result);
}
createTrade();
*/
async function getTrade() {
  const trades = await Trades.find({seller: 'Aidan'}).limit(10).sort({seller: 1}).select({name: 1, seller: 1});
  console.log(trades);
}

getTrade();
