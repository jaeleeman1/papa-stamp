var express = require('express');
var router = express.Router();
var config = require('../config/service_config');
var mysql = require('mysql');
var getConnection = require('../config/db_connection');
var request = require('request');
var admin = require("firebase-admin");
var serviceAccount = require("../config/papastamp-a72f6-firebase-adminsdk-qqp2q-6484dc5daa.json");
var crypto = require( "crypto" );
var logger = require('../config/logger');

const TAG = "[USER INFO] ";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://papastamp-a72f6.firebaseio.com"
});

/* GET encrypt uid */
router.get('/encryptUid', function(req, res, next) {
    var dataId = req.query.phone_id;
    var secrect = config.secrectKey;
    var cipher = crypto.createCipher("aes-128-ecb", secrect);
    var crypted = cipher.update(dataId, 'utf8', 'hex');
    crypted += cipher.final('hex');

    logger.debug(TAG, 'Phone ID : ' + dataId);
    logger.debug(TAG, 'Encrypted ID : ' + crypted);

    res.send({cryptedData: crypted});
});

/* GET decrypt uid */
router.get('/decryptUid', function(req, res, next) {
    var text = "7c28d1c5088f01cda7e4ca654ec88ef8";
    var secrect = "Glu0r6o0GzBZIe0Qsrh2FA==";
    var cipher = crypto.createDecipher('aes-128-ecb', secrect);
    var decrypted = cipher.update(text, 'hex', 'utf8');
    decrypted += cipher.final('utf8');

    console.log( "Input : ", text );
    console.log( "secrect : ", secrect );
    console.log( "Decrypted : ", decrypted );

    res.send({decryptedData: decrypted});
});

/* GET login (session) */
router.get('/init', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('admin/loginMain',{nickName: req.body.login_id, listLength : 0 });
});

router.post('/tablet/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{nickName: req.body.login_id, listLength : 0 });
});

// Get Firebase User Create
router.get('/userCreate', function(req, res, next) {
    logger.info(TAG, 'Get user auth');

    var userId = req.headers.user_id;
    logger.debug(TAG, 'User ID : ' + userId);

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid headers value');
        res.status(400);
        res.send('Invalid headers error');
    }

    admin.auth().createCustomToken(userId)
        .then(function(customToken) {
            // Send token back to client
            logger.debug(TAG, 'Custom token : ', customToken);
            res.send({customToken:customToken});
        })
        .catch(function(error) {
            logger.error(TAG, 'Error creating custom token : ', error);
            console.log("Error creating custom token:", error);
        });
});

// Get User Login
router.post('/userLogin', function(req, res, next) {
    logger.info(TAG, 'Get user login');

    var userId = req.headers.user_id;
    logger.debug(TAG, 'User ID : ' + userId);

    var userEmail = req.body.user_email;
    var userPassword = req.body.user_password;

    logger.debug(TAG, 'Login EMAIL : ' + userEmail);
    logger.debug(TAG, 'Login PW : ' + userPassword);

    if(userEmail == null || userEmail == undefined &&
        userPassword == null || userPassword == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var userEmailCheck = '0';
        var userPwCheck = '0';
        var selectLoginQuery = "select USER_EMAIL, USER_PASSWORD, (select exists (select * from SB_USER_INFO where USER_EMAIL = "+ mysql.escape(userEmail) + ")) as EMAIL_CHECK" +
            " from SB_USER_INFO where USER_TYPE = 02 and USER_EMAIL = "+ mysql.escape(userEmail) + " and USER_PASSWORD = "+mysql.escape(userPassword);
        connection.query(selectLoginQuery, function (err, userLogin) {
            if (err) {
                logger.error(TAG, "DB selectLoginQuery error : " + err);
                res.status(400);
                res.send('User sign in error');
            }else{
                logger.debug(TAG, 'Select user login success : ' + JSON.stringify(userLogin));
                if(userLogin.length < 1) {
                    res.status(500);
                    res.send('No user info');
                }else {
                    var userInfo = {
                        user_id : userId
                    }

                    userEmailCheck = userLogin[0].EMAIL_CHECK

                    if(userLogin[0].USER_PASSWORD == userPassword) {
                        userPwCheck = '1';
                    }
                    req.session.userInfo = userInfo;
                    res.send({userId: userLogin[0].USER_ID, userEmailCheck: userEmailCheck, userPwCheck: userPwCheck});
                }
            }
            connection.release();
        });
    });
});

/* GET user info */
router.get('/userInfo', function(req, res, next) {
    // var userId = req.query.user_id;
    var userId = req.headers.user_id;

    getConnection(function (err, connection){
        // Select User Infomation
        var selectUserInfo = "select USER_PASSWORD from SB_USER_INFO where USER_ID = "+ mysql.escape(userId);
        connection.query(selectUserInfo, function (err, row) {
            if (err) {
                console.error("[User Info Error] Select User Info Error : " + err);
                throw err;
            }else{
                console.log("[User Info] Select User Info Success ### " + JSON.stringify(row));
                res.status(200);
                res.send(row[0].USER_PASSWORD);
            }
            connection.release();
        });
    });
});

/* POST user info */
router.post('/userInfo', function(req, res, next) {
    var userId = req.headers.user_id;
    var accessToken = req.body.access_token;
    var userEmail = req.body.user_email;
    var userPassword = req.body.user_password;

    getConnection(function (err, connection){
        // Insert User Infomation
        var insertUserInfo = "insert into SB_USER_INFO (USER_ID, ACCESS_TOKEN, USER_EMAIL, USER_PASSWORD, USER_TYPE) " +
            "values("+ mysql.escape(userId) + ","+ mysql.escape(accessToken) + ","+ mysql.escape(userEmail) + ",password("+mysql.escape(userPassword) + "), '01') " +
            "on duplicate key update ACCESS_TOKEN="+ mysql.escape(accessToken) + ", USER_EMAIL="+ mysql.escape(userEmail) +", USER_PASSWORD="+mysql.escape(userPassword) +", USER_TYPE=01";
        connection.query(insertUserInfo, function (err, userInfoData) {
            if (err) {
                logger.error(TAG, "Insert User Info Error : " + err);
                res.status(500);
                throw err;
            }else{
                logger.debug(TAG, "Insert User Info Success ### " + JSON.stringify(userInfoData));
                res.status(200);
                res.send();
               /* var insertUserPushInfo = "INSERT INTO SB_USER_PUSH_INFO (SHOP_ID, USER_ID) VALUES ('SB-SHOP-00001',"+ mysql.escape(userId) + "), ('SB-SHOP-00002',"+ mysql.escape(userId) + ")," +
                    "('SB-SHOP-00003',"+ mysql.escape(userId) + "), ('SB-SHOP-00004',"+ mysql.escape(userId) + "), ('SB-SHOP-00005',"+ mysql.escape(userId) +")";
                connection.query(insertUserPushInfo, function (err, userPushData) {
                    if (err) {
                        logger.error(TAG, "DB selectShopPushQuery error : " + err);
                        res.status(400);
                        res.send('Select shop push info error');
                    } else {
                        console.log("[User Info] Insert User Info Success ### " + JSON.stringify(userPushData));
                        res.status(200);
                        res.send();
                    }
                });*/
            }
            connection.release();
        });
    });
});

module.exports = router;
