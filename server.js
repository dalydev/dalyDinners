var host_uri = "localhost"; //

var express = require('express');
var fs = require('fs');  // for certs
var os = require('os');
var https = require('https');
var http  = require('http');
var platform = require('./routes/server_nodejs/platform.js');
var runtime = platform.configure();
var secrets  = require('./secrets.js');

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

//console.log(secrets.mongodb.connectionStr());

var myCollections ={}
var mDB;

mDB = secrets.mongodb.connectionStr();

var db = MongoClient.connect(mDB, function(err,db){
    if(err)
        throw err;
    console.log("connected to the mongoDB at: " + runtime.mongodb);

    myCollections.categories = db.collection('categories');
    myCollections.items = db.collection('items');
    myCollections.specials = db.collection('specials');
});

var compression = require('compression');

var toobusy = require('toobusy-js');

//var path = require('path');
//var logger = require('morgan');
var bodyParser = require('body-parser');


//var bluemix = require("./routes/middlewares/bluemix.js"); // force https

var helmet = require('helmet');

var connectionListener = false;

var app = express();

app.use(compression()); // must be first, GZIP all assets https://www.sitepoint.com/5-easy-performance-tweaks-node-js-express/
// log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(helmet()); // by default - removes:  ; adds: X-Frame-Options:SAMEORIGIN

// middleware which blocks requests when we're too busy
app.use(function(req, res, next) {  // HAS TO BE FIRST
    if (toobusy()) {
        res.status(503).send("<p><p>&nbsp&nbsp<h1>The server is busy, please try later, possibly in about 30 seconds.</h1>");
    } else {
        next();
    }
});

console.log(runtime);

if (runtime.isLocalHost) {
    // windows if openssl installed
    // set OPENSSL_CONF=C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.cfg
    // C:\Program Files (x86)\OpenSSL-Win32\bin\openssl genrsa -out test-key.pem 1024

// test ssl keys with openssl installed - Google for your platform  https://www.openssl.org/
// openssl genrsa -out test-key.pem 1024
// openssl req -new -key test-key.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey test-key.pem -out test-cert.pem
    console.log("*** Using temp SSL keys on the nodejs server");
    var privateKey   = fs.readFileSync('ssl/test-key.pem');
    var certificate  = fs.readFileSync('ssl/test-cert.pem');

    //	var credentials = {key: privateKey, cert: certificate};

    // use local self-signed cert
    var localCertOptions = {
        key: privateKey,
        cert: certificate,
        requestCert: false,
        rejectUnauthorized: false
    };


    https.createServer (localCertOptions, app).listen (runtime.port, function () {
        console.log(new Date().toISOString());
        console.log (runtime.architecture + ' server startup ok on port: ' + runtime.port);

    });


} else { // not local, its in the cloud somewhere bluemix/heroku

    app.set('port', runtime.port);

    if (runtime.architecture === "bluemix")
    {
        // cloud loads certs and establish secure connection
        app.listen(runtime.port, function() {

            console.log (runtime.architecture + ' server startup ok on port: ' + runtime.port);
        });
    }
    else
    if (runtime.architecture === "heroku")
    {
        app.listen(runtime.port, function() {
            console.log (runtime.architecture + ' server startup ok on port: ' + runtime.port);
        });
    }
}

//app.use(logger('dev'));  // log every request to the console   morgan
app.use(bodyParser.json());

app.enable('trust proxy');

app.use (function (req, res, next) {  // req.protocol
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        console.log("redirecting from http to https");
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use( // public client pages  THIS FINDS _ngClient/index.html
    "/", //the URL throught which you want to access   static content
    express.static(__dirname + '/_ngClient')  //where your static content is located in your filesystem
);
app.use( // alias to third party js code etc
    "/js_thirdparty", //the URL throught which you want to access   content
    express.static(__dirname + '/js_thirdparty')
);

console.log(__dirname + '/_ngClient');

app.all('/*', function(req, res, next) {
    // CORS headers,     the * means any client can consume the service???
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS;
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});


// all the server rest type route paths are mapped in index.js
// app.use('/', require('./routes')); // will load/use index.js by default from this folder

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");

    var err = new Error('Route Not Found, are you using the correct http verb / is it defined?');
    err.status = 404;

    next(err);
});
