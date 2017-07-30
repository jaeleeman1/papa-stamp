var express = require('express');
var router = express.Router();
var config = require('../lib/config');
var getConnection = require('../lib/db_connection');
var request = require('request');

/* GET login (session) */
router.get('/init', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('login/loginMain',{nickName: req.body.login_id, listLength : 0 });
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

module.exports = router;
