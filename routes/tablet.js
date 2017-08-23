var express = require('express');
var router = express.Router();
var http = require('http');
var path = require('path');
var mysql = require('mysql');
var getConnection = require('../config/db_connection');
var config = require('../config/service_config');
var logger = require('../config/logger');
var request = require('request');

const TAG = "[TABLET INFO] ";

/* Tablet Page API */

//Setting Socket.io
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

var httpServer =http.createServer(app).listen(8060, function(req,res){
    logger.debug(TAG, 'Socket IO server has been started');
});

var io = require('socket.io').listen(httpServer);
io.sockets.on('connection',function(socket){
    socket.on('shopClient',function(data){
        logger.debug(TAG, 'Socket papa stamp success! : '+data.userData);
        io.sockets.emit(data.userData,'Send message success!');
    })
});

/* GET tablet Login */
router.get('/tabletLogin', function(req, res, next) {
    var userInfo = req.session.userInfo;
    var user_id = '';

    try {
        user_id = userInfo.user_id;
    }catch(err) {
        logger.error(TAG, "Login session error : " + err);
    }
    logger.debug(TAG, 'Session Info' + userInfo);

    if(user_id == '') {
        res.render('tablet/tabletLogin', {url:config.url});
    }else {
        res.render('tablet/tabletAdmin',{nickName: user_id, listLength : 0 });
    }
});

router.get('/tabletLogout', function(req, res, next) {
    req.session.destory(function(err){
        if(err) {
            logger.error(TAG, "Logout error : " + err);
        }
        res.render('tablet/tabletInit', {url:config.url});
    });
});


router.get('/tabletSignIn', function(req, res, next) {
    var loginId = req.query.login_id;
    var loginPassword = req.query.login_password;

    logger.debug(TAG, 'Login ID : ' + loginId);
    logger.debug(TAG, 'Login PW : ' + loginPassword);

    if(loginId == null || loginId == undefined &&
        loginPassword == null || loginPassword == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var loginIdCheck = '0';
        var loginPwCheck = '0';
        var selectLoginQuery = "select SHOP_ID, USER_ID, (select exists (select * from SB_USER_INFO where USER_ID = "+ mysql.escape(loginId) + ")) as ID_CHECK, USER_PASSWORD" +
            " from SB_USER_INFO where USER_TYPE = 02 and USER_ID = "+ mysql.escape(loginId) + " and USER_PASSWORD = "+mysql.escape(loginPassword);
        connection.query(selectLoginQuery, loginId, function (err, tabletLogin) {
            if (err) {
                logger.error(TAG, "DB selectLoginQuery error : " + err);
                res.status(400);
                res.send('Tablet sign in error');
            }else{
                if(tabletLogin.length < 1) {
                    res.status(500);
                    res.send('No user info');
                }else {
                    var userInfo = {
                        user_id : loginId
                    }

                    loginIdCheck = tabletLogin[0].ID_CHECK

                    if(tabletLogin[0].USER_PASSWORD == loginPassword) {
                        loginPwCheck = '1';
                    }
                    req.session.userInfo = userInfo;
                    res.send({shopId: tabletLogin[0].SHOP_ID, userId: tabletLogin[0].USER_ID, loginIdCheck: loginIdCheck, loginPwCheck: loginPwCheck});
                }
            }
            connection.release();
        });
    });
});

router.post('/login/initPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('main/initPage',{nickName: req.body.login_id, listLength : 0 });
});


/* GET Tablet Main */
router.get('/tabletMain', function(req, res, next) {
    var shopId = req.query.shop_id;
    var userId = req.query.user_id;

    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    res.render('tablet/tabletMain',{url:config.url, nickName: req.body.login_id, listLength : 0 });
});

//Put Insert Stamp History
router.put('/insertStampHistory', function (req, res, next) {
    logger.info(TAG, 'Insert user stamp history');
    var userId = req.headers.user_id;
    var shopId = req.body.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    io.sockets.emit(userId,{sendData: "API papa stamp success!"});
    logger.debug(TAG, 'API papa stamp success! : ');

    getConnection(function (err, connection){
        var insertStampHistory = 'insert into SB_USER_PUSH_HIS (SHOP_ID, USER_ID) value ('+mysql.escape(shopId)+', '+mysql.escape(userId)+')';
        connection.query(insertStampHistory, function (err, row) {
            if (err) {
                logger.error(TAG, "DB insertStampHistory error : " + err);
                res.status(400);
                res.send('Insert user push history error');
            }else{
                logger.debug(TAG, 'Insert user push history success');
                res.status(200);
                res.send({resultData:'Insert user push history success'});
            }
            connection.release();
        });
    });
});

/* POST Papastamp Push Stamp */
router.post('/pushStamp', function(req, res, next) {
    var userId = req.headers.user_id;
    var shopId = req.body.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    io.sockets.emit('01026181715',{sendData: "API papa stamp success!"});
    logger.debug(TAG, 'API papa stamp success! : ');
    res.status(200);
    res.send("success");
});

router.post('/tablet/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{url:config.url, nickName: req.body.login_id, listLength : 0 });
});

module.exports = router;
