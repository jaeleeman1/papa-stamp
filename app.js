var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var init = require('./routes/init');
var map = require('./routes/map');
var shop = require('./routes/shop');
var tablet = require('./routes/tablet');
var user = require('./routes/user');

var admin = require('./routes/admin');
var notification = require('./routes/notification');
var download = require('./routes/download');

// app express
var app = express( );

function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json({nope: true});
    } else {
        next();
    }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({
    secret: 'keyboard cat',
    //store: new redisStore({host:'couphone-redis-0001-001.jh3alo.0001.apn2.cache.amazonaws.com', port:6379, client: client}),
    resave: false,
    saveUninitialized: true
}));

app.use(ignoreFavicon);

const mapUrl = '/map/v1.0';
const shopUrl = '/shop/v1.0';
const tabletUrl = '/tablet/v1.0';
const userUrl = '/user/v1.0';



const adminURL = '/admin/v1.0';

const notificationURL = '/notification/v1.0';
const downloadURL = '/download/v1.0';

app.use('/', init);
app.use(mapUrl, map);
app.use(shopUrl, shop);
app.use(tabletUrl, tablet);

app.use(userUrl, user);
app.use(downloadURL, download);



app.use('/admin', admin);
app.use('/tablet', tablet);
app.use('/notification', notification);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('errorMain');
});

module.exports = app;
