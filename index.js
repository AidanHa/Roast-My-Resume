
//third party middleware
const mongoose = require('mongoose');
const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');

//custom middleware + routes
const logger = require('./middleware/logger');
const auth = require('./middleware/Authenticate');
const tradeTypesRouter = require('./routes/tradeTypes');
const homeRouter = require('./routes/home');

//create app object + set/use middleware
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

//schema for Mongo DB
const tradesSchema = new mongoose.Schema({
  name: String,
  category: String,
  seller: String,
  price: Number,
  date: { type: Date, default: Date.now},
  description: String,
});

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
//Configuration with npm config
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server ' + config.get('mail.host'));
console.log('Mail PW: ' + config.get('mail.password')); //set password="password"

//listen on express server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

//connect to server
mongoose.connect('mongodb://localhost/playground').then(() => console.log('Connected to database')).catch((err) => console.error('Could not connect to mongodb', err));

const Trades = mongoose.model('Trades', tradesSchema);//database w model
async function createTrade(nameReq, categoryReq, sellerReq, priceReq, descriptionReq) {
 
  const trades = new Trades({
    name: nameReq,
    category: categoryReq,
    seller: sellerReq,
    price: priceReq,
    description: descriptionReq,
  });
  const result = await trades.save();
  console.log(result);
}
async function getTrade() {
  //const trades = await Trades.find({seller: 'Aidan'}).limit(10).sort({seller: 1}).select({name: 1, seller: 1});
  //const trades = await Trades.find({price: {$gte: 10, $lte: 40}}).limit(10).sort({seller: 1}).select({name: 1, seller: 1});
  const trades = await Trades.find({price: {$in: [10, 15, 20]}}).limit(10).sort({seller: 1}).select({name: 1, seller: 1});
  console.log(trades);
}
//createTrade('Sony Earbuds', "Electronics", "Jonathan", 40, "High quality extra base Sony Earbuds");
getTrade();
