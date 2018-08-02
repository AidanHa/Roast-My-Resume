
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
  name: {type: String, required: true},
  category: {type: String, required: true},
  seller: String,
  price: {type: Number, required: true},
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
 
  const trade = new Trades({
    name: nameReq,
    category: categoryReq,
    seller: sellerReq,
    price: priceReq,
    description: descriptionReq,
  });
  try {
    const result = await trade.save();
    console.log(result);
    //await trade.validate();
  } catch(ex) {
    console.log(ex.message);
  }
  
}
async function getTrade() {
  const pageNumber = 2;
  const pageSize = 10;
  //const trade = await Trades.find({seller: 'Aidan'}).limit(10).sort({seller: 1}).select({name: 1, seller: 1});
  //const trade = await Trades.find({price: {$gte: 10, $lte: 40}}).limit(10).sort({seller: 1}).select({name: 1, seller: 1});
  //const trade = await Trades.find({price: {$in: [10, 15, 20]}}).limit(10).sort({seller: 1}).select({name: 1, seller: 1});
  //const trade = await Trades.find().or([{seller: 'Aidan'}, {price: 40}]);
  //const trade = await Trades.find({seller: /^Ai/});
  //const trade = await Trades.find({seller: /n$/});
  //const trade = await Trades.find({seller: /.*an.*/}).count();
  //const trade = await Trades.find({seller: /.*an.*/}).skip((pageNumber - 1) * pageSize).limit(pageSize);
  const trade = await Trades.find({});
  console.log(trade);
}
/*
async function updateTrade(id, newName) {//query first
  const trade = await Trades.findById(id);

  if (!trade) {
    return;
  }
  trade.name = newName;
  const result = await trade.save();
  console.log(result);
}*/
async function updateTrade(nameReq, newName) {//update first
  const trade = await Trades.update({name: nameReq}, {
    $set: {
      name: newName
    }
  });
  console.log(trade);

}
async function removeTrade(id) {//update first
  const trade = await Trades.deleteOne({_id: id});
  console.log(trade);
}
//createTrade('Sony Earbuds', "Electronics", "Jonathan", 40, "High quality extra base Sony Earbuds");
//createTrade('Cool Poster', "Others", "Aidan", 20, "Team Liquid Poster");
//getTrade();
//updateTrade('Cool Poster', 'TL Poster');
//removeTrade('5b61a9363bf32b58747ec5c1');