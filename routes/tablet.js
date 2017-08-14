var express = require('express');
var path = require('path');
var http = require('http');
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
    socket.on('fromclient',function(data){
        socket.broadcast.emit('toclient',data); // 자신을 제외하고 다른 클라이언트에게 보냄
        socket.emit('toclient',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
        console.log('Message from client :'+data.msg);
    })
});

/* GET login (session) */
router.get('/pushStamp', function(req, res, next) {
    io.sockets.on('connection',function(socket){
        socket.emit('toclient',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
    });
    res.status(200);
});

/* GET login (session) */
router.get('/main', function(req, res, next) {
    //cross-domain
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    res.render('tablet/tabletMain',{url:config.url, nickName: req.body.login_id, listLength : 0 });
});

router.post('/tablet/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{url:config.url, nickName: req.body.login_id, listLength : 0 });
});

module.exports = router;
