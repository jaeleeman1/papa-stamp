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
    logger.debug(TAG, 'Session Info : ',  userInfo);

    if(user_id == '') {
        res.render('tablet/tabletLogin', {url:config.url});
    }else {
        res.render('tablet/tabletMain',{url:config.url, nickName: user_id, listLength : 0 });
    }
});

router.get('/tabletLogout', function(req, res, next) {
    console.log('xxxxxxxxxxx ' , req.session);
    res.render('tablet/tabletLogin', {url:config.url});
    /*req.session.destory(function(err){
         if(err) {
             logger.error(TAG, "Logout error : " + err);
         }
        res.render('tablet/tabletLogin', {url:config.url});
    });*/
});


router.get('/tabletInit', function(req, res, next) {
    var adminId = req.query.login_id;
    var adminPassword = req.query.login_password;

    logger.debug(TAG, 'Login ID : ' + adminId);
    logger.debug(TAG, 'Login PW : ' + adminPassword);

    if(adminId == null || adminId == undefined &&
        adminPassword == null || adminPassword == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var adminIdCheck = '0';
        var adminPwCheck = '0';
        var selectLoginQuery = "select SHOP_ID, USER_ID, (select exists (select * from SB_USER_INFO where USER_ID = "+ mysql.escape(adminId) + ")) as ID_CHECK, USER_PASSWORD" +
            " from SB_USER_INFO where USER_TYPE = 02 and USER_ID = "+ mysql.escape(adminId) + " and USER_PASSWORD = "+mysql.escape(adminPassword);
        connection.query(selectLoginQuery, function (err, tabletLogin) {
            if (err) {
                logger.error(TAG, "DB selectLoginQuery error : " + err);
                res.status(400);
                res.send('Tablet sign in error');
            }else{
                logger.debug(TAG, 'Select shop login success : ' + JSON.stringify(tabletLogin));
                if(tabletLogin.length < 1) {
                    res.status(500);
                    res.send('No user info');
                }else {
                    var userInfo = {
                        user_id : adminId
                    }

                    adminIdCheck = tabletLogin[0].ID_CHECK

                    if(tabletLogin[0].USER_PASSWORD == adminPassword) {
                        adminPwCheck = '1';
                    }
                    req.session.userInfo = userInfo;
                    res.send({shopId: tabletLogin[0].SHOP_ID, adminId: tabletLogin[0].USER_ID, adminIdCheck: adminIdCheck, adminPwCheck: adminPwCheck});
                }
            }
            connection.release();
        });
    });
});


/* GET Tablet Main */
router.get('/tabletMain', function(req, res, next) {
    var shopId = 'SB-SHOP-00001';//req.query.shop_id;
    var userId = '01037291715';//req.query.user_id;

    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    // Select shop order number
    getConnection(function (err, connection){
        var selectShopOrderNumber = 'select SHOP_CURRENT_NUM from SB_SHOP_PUSH_INFO as SSM where SHOP_ID ='+mysql.escape(shopId);
        connection.query(selectShopOrderNumber, function (err, currentNumberData) {
            if (err) {
                logger.error(TAG, "DB selectShopOrderNumber error : " + err);
                res.status(400);
                res.send('Select shop order number error');
            }else{
                logger.debug(TAG, 'Select shop order number success : ' + JSON.stringify(currentNumberData));
                res.status(200);
                res.render('tablet/tabletMain',{url:config.url, nickName: req.body.login_id, listLength:0, currentNumberData:currentNumberData[0] });
            }
            connection.release();
        });
    });
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

    getConnection(function (err, connection){
        var selectStampHistoryCount = 'select count(*) as CNT from SB_USER_PUSH_HIS where USED_YN = "N" and SHOP_ID = '+mysql.escape(shopId)+' and USER_ID = '+mysql.escape(userId);
        connection.query(selectStampHistoryCount, function (err, stampHistoryCount) {
            if (err) {
                logger.error(TAG, "DB selectStampHistoryCount error : " + err);
                res.status(400);
                res.send('select user push history count error');
            }else{
                if(stampHistoryCount[0].CNT < 10) {
                    var insertStampHistory = 'insert into SB_USER_PUSH_HIS (SHOP_ID, USER_ID) value (' + mysql.escape(shopId) + ', ' + mysql.escape(userId) + ')';
                    connection.query(insertStampHistory, function (err, row) {
                        if (err) {
                            logger.error(TAG, "DB insertStampHistory error : " + err);
                            res.status(400);
                            res.send('Insert user push history error');
                        } else {
                            logger.debug(TAG, 'Insert user push history success');

                            io.sockets.emit(shopId+userId, {sendData: "API papa stamp success!"});
                            logger.debug(TAG, 'API papa stamp success! : ', shopId+userId);

                            res.status(200);
                            res.send({resultData: 'Insert user push history success'});
                        }
                    });
                }
                if (stampHistoryCount[0].CNT == 9) {
                    var updatePushHistory = 'update SB_USER_PUSH_HIS set USED_YN = "Y" where  SHOP_ID = '+mysql.escape(shopId)+' and USER_ID = '+mysql.escape(userId)+' and USED_YN = "N" order by REG_DT ASC limit 10';
                    connection.query(updatePushHistory, function (err, UpdateCouphoneData) {
                        if (err) {
                            logger.error(TAG, "DB updatePushHistory error : " + err);
                            res.status(400);
                            res.send('Update push history error');
                        }else{
                            logger.debug(TAG, 'Update push history success');

                            var updateCouphoneMapping = 'update SB_USER_COUPHONE SET USER_ID = '+mysql.escape(userId)+', MAPPING_YN = "Y"' +
                                'where MAPPING_YN = "N" and USED_YN = "N" and SHOP_ID = '+mysql.escape(shopId)+' order by REG_DT ASC limit 1';
                            connection.query(updateCouphoneMapping, function (err, UpdateCouphoneData) {
                                if (err) {
                                    logger.error(TAG, "DB updateCouphoneMapping error : " + err);
                                    res.status(400);
                                    res.send('Update couphone mapping error');
                                }else{
                                    logger.debug(TAG, 'Update couphone mapping success');

                                    res.status(200);
                                    res.send({resultData:'Update couphone mapping success'});
                                }
                            });
                        }
                    });
                }
            }
            connection.release();
        });
    });
});






router.post('/admin/initPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('main/initPage',{nickName: req.body.login_id, listLength : 0 });
});

router.get('/tabletAdmin', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletAdmin',{url:config.url, nickName: req.body.login_id, listLength : 0 });
});

router.get('/temppushStamp', function(req, res, next) {
    io.sockets.emit('01026181715',{sendData: "API papa stamp success!"});
    logger.debug(TAG, 'API papa stamp success! : ', '01026181715');
    res.send({url:config.url});
});


module.exports = router;
