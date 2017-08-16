var express = require('express');
var path = require('path');
var http = require('http');
var fs = require('fs');
var router = express.Router();
var config = require('../config/service_config');
var getConnection = require('../config/db_connection');
var request = require('request');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

var httpServer =http.createServer(app).listen(8060, function(req,res){
    console.log('Socket IO server has been started');
});

var io = require('socket.io').listen(httpServer);
io.sockets.on('connection',function(socket){
    socket.on('shopClient',function(data){
        console.log('Socket papa stamp success! :'+data.userData);
        io.sockets.emit(data.userData,'Send message success!');
    })
});

/* GET login (session) */
router.get('/pushStamp', function(req, res, next) {
    console.log('API papa stamp success! :');
    io.sockets.emit('01026181715',{sendData: "API papa stamp success!"}); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
    res.status(200);
    res.send("success");
});

/* GET login (session) */
router.get('/main', function(req, res, next) {
    res.render('tablet/tabletMain',{url:config.url, nickName: req.body.login_id, listLength : 0 });
});

router.post('/tablet/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{url:config.url, nickName: req.body.login_id, listLength : 0 });
});

module.exports = router;
