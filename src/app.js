// Packify
// Server - app.js
// Author: Alex Fuerst, Cody Van De Mark

// ------ Requires ------
var path = require('path');
var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var url = require('url');
var csrf = require('csurf');
var gtest = require('./GeocodeTest.js');

// find our mongo database. 
var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/Packify";

// attempt to connect to database
var db = mongoose.connect(dbURL, function (err) {
    if (err) {
        console.log("could not connect to db");
        throw err;
    }
});

// temporarily set the redis URL to the local machine for testing
var redisURL = {
    hostname: 'localhost',
    port: 6379
};

// If in production redis URL will be set here
var redisPass;
if (process.env.REDISCLOUD_URL) {
    redisURL = url.parse(process.env.REDISCLOUD_URL);
    redisPass = redisURL.auth.split(":")[1];
} else if (process.env.REDIS_URL) {
    redisURL = url.parse(process.env.REDIS_URL);
    redisPass = redisURL.auth.split(":")[1];
}

// grab our request router
var router = require('./router.js');

// try to grab the port. Visual Studio with Node tools will set this as
// will production. If not set fall back to 3000
var port = process.env.PORT || process.env.NODE_PORT || 3000;

// set up our express app/server
var app = express();

// set our "assets" path to the client folder
app.use('/assets', express.static(path.resolve(__dirname + '../../client')));

// add compression middleware
app.use(compression());

// add body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// set up our session information
app.use(session({
    key: "sessionid",
    
    // use the redis info gathered above
    store: new RedisStore({
        host: redisURL.hostname,
        port: redisURL.port,
        pass: redisPass
    }),

    secret: "Super Duper Secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true
    }
}));

// set our rendering engine
app.set('view engine', 'jade');

// tell express where our views are
app.set('views', __dirname + "/views");
app.use(favicon(__dirname + "/../client/img/favicon.ico"));

// little security precaution
app.disable('x-powered-by');

app.use(cookieParser());

app.use(csrf());
app.use(function (err, req, res, next) {
    if (err.code !== "EBADCSRFTOKEN") return next(err);
    
    return;
});

router(app);

app.listen(port, function (err) {
    if (err) {
        throw err;
    }

    console.log("Listening on Port: " + port);
});