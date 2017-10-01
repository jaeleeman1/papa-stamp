var express = require('express');
var router = express.Router();
var config = require('../config/service_config');
var getConnection = require('../config/db_connection');
var request = require('request');
var admin = require("firebase-admin");
var serviceAccount = require("../config/papastamp-a72f6-firebase-adminsdk-qqp2q-6484dc5daa.json");

const TAG = "[USER INFO] ";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://papastamp-a72f6.firebaseio.com"
});

// Get Firebase User Auth
router.get('/userAuth', function(req, res, next) {
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







/* GET login (session) */
router.get('/init', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('admin/loginMain',{nickName: req.body.login_id, listLength : 0 });
});

router.post('/tablet/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{nickName: req.body.login_id, listLength : 0 });
});

/* GET user info */
router.get('/userInfo', function(req, res, next) {
    var userId = req.query.user_id;

    getConnection(function (err, connection){
        // Select User Infomation
        var selectUserInfo = 'select USER_PASSWORD from SB_USER_INFO where USER_ID = ?';
        connection.query(selectUserInfo, userId, function (err, row) {
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
    var userId = req.body.user_id;
    var userPw = req.body.user_pw;

    getConnection(function (err, connection){
        // Insert User Infomation
        var insertUserInfo = 'INSERT INTO SB_USER_INFO (USER_ID, ACCESS_TOKEN, USER_TYPE) VALUES(?, password(?), "01")';
        connection.query(insertUserInfo, [userId, userPw], function (err, row) {
            if (err) {
                console.error("[User Info Error] Insert User Info Error : " + err);
                res.status(500);
                throw err;
            }else{
                console.log("[User Info] Insert User Info Success ### " + JSON.stringify(row));
                res.status(200);
                res.send();
            }
            connection.release();
        });
    });
});

module.exports = router;
