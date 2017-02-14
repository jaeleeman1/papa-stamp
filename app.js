var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var food = require('./routes/food');
var taxi = require('./routes/taxi');
var shopping = require('./routes/shopping');
var wechat = require('./routes/wechat');
var agentWechat = require('./routes/agentWechat');
var dbApi = require('./routes/dbApi');
var mapTest = require('./routes/mapTest'); // 테스트 후 삭제 예정
var responsor = require('./routes/responsor'); // Will be removed after test

// app express
var app = express( );

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/index', index);
app.use('/users', users);
app.use('/food', food);
app.use('/taxi', taxi);
app.use('/shopping', shopping);
app.use('/', wechat);
app.use('/wechat', agentWechat);
app.use('/api', dbApi);
app.use('/mapTest', mapTest);
app.use('/responsor', responsor);


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
  res.render('error');
});

module.exports = app;
