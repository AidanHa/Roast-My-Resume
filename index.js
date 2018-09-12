
//third party middleware
const mongoose = require('mongoose');
const config = require('config');
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const Joi = require('joi');
const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
let multer = require('multer');
let upload = multer();

//custom middleware + routes
const auth = require('./middleware/Authenticate');
const tradesRouter = require('./routes/trades');
const usersRouter = require('./routes/users');
const homeRouter = require('./routes/home');


//create app object + set/use middleware
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views'); //all templates here


app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(flash());


// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//set routes
app.use('/api/trades', tradesRouter);
app.use('/api/users', usersRouter);
app.use('/', homeRouter);

//connect to server
mongoose.connect('mongodb://localhost/TrendingTrades').then(() => console.log('Connected to database')).catch((err) => console.error('Could not connect to mongodb', err));

//listen on express server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
