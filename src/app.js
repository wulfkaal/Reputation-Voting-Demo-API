// const Raven = require('raven');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const daosController = require('./controllers/daos')
const proposalsController = require('./controllers/proposals')
const usersController = require('./controllers/users')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;

let globalDB

MongoClient.connect(process.env.SEMADA_DB, function(err, client) {
  globalDB = client.db("semadaweb")
})

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = globalDB
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// var whitelist = [config.get('app.origin')]
var whitelist = [process.env.SEMADA_APP_ORIGIN, '184.23.241.229']
const corsOptions = {
  origin: whitelist,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  allowedHeaders: ['content-type', 'authorization']
}

app.use(cors(corsOptions));


const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.SEMADA_AUTH0_JWKS_URI
  }),
  audience: process.env.SEMADA_API_IDENTIFIER,
  issuer: process.env.SEMADA_AUTH0_DOMAIN,
  algorithms: ['RS256']
});

//authCheck middleware handles retrieving a valid user from the database.
//for test cases the user is based on a header value, otherwise based on an Auth0 user
//a user will be available in all router actions as "req.user" and queries can be done with "req.user.id" in where clause.
var authCheck = [];

authCheck.push((req, res, next) => {
  // this is a spot where you can inject anything you want to inspect a request
  // console.log(req.header)
  next()
})

app.use('/daos', authCheck, checkJwt, daosController)
app.use('/proposals', authCheck, checkJwt, proposalsController)
app.use('/users', authCheck, checkJwt, usersController)


//NOTE: order of the 404 and error handlers below matters.
//These must come after all other middleware and route handlers, and in this order.

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// // error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development and test
  res.locals.message = err.message;
  if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'){
    res.locals.error = err
    console.log(err)
  } else {
    res.locals.error = {}
  }

  if (res.headersSent) {
    return next(err)
  }
  // render the error page
  res.status(err.status || 500).send('Unable to process request');
  // res.render('error');
});

module.exports = app
