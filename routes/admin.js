var express = require('express');
var router = express.Router();
var config = require('../lib/config');
var getConnection = require('../lib/db_connection');
var request = require('request');

/* GET login (session) */
router.get('/login', function(req, res, next) {
    var userInfo = req.session.userInfo;
    var user_id = '';

    try {
        user_id = userInfo.user_id;
    }catch(e) {console.error('session error'+ e);}

    console.log('session : ' + userInfo);
    if(user_id == '') {
        res.render('admin/login-logout', {url:config.url});
    }else {
        res.render('admin/admin-main',{nickName: user_id, listLength : 0 });
    }
});

/* GET logout */
router.get('/logout', function(req, res, next) {
    req.session.destory(function(err){
        if(err) console.err('err', err);
        res.render('admin/login-logout', {url:config.url});
    });
});

router.get('/login/mainPage', function(req, res, next) {
    getConnection(function (err, connection){
        var loginId = req.query.login_id;
        var loginPassword = req.query.login_password;

        var selectIdQuery = "select exists (select * from SB_USER_INFO AS TSL where TSL.USER_ID = ?) as ID_CHECK";
        connection.query(selectIdQuery, loginId, function (err, rowId) {
            if (err) {
                console.error("*** initPage select id Error : " , err);
            }else{
                var loginIdCheck = rowId[0].ID_CHECK;
                var loginPwCheck = '0';
                if(loginIdCheck == '1') {
                    var selectPwQuery = "select exists (select * from SB_USER_INFO AS TSL where TSL.USER_ID = ? and TSL.USER_PASSWORD = ?) as PW_CHECK";
                    connection.query(selectPwQuery, [loginId, loginPassword], function (err, rowPw) {
                        if (err) {
                            console.error("*** initPage select password Error : ", err);
                        } else {
                            loginPwCheck = rowPw[0].PW_CHECK;
                            var userInfo = {
                                user_id : loginId
                            }
                            req.session.userInfo = userInfo;
                            res.send({loginIdCheck: loginIdCheck, loginPwCheck: loginPwCheck});
                        }
                    });
                }else {
                    res.send({loginIdCheck: loginIdCheck, loginPwCheck: loginPwCheck});
                }
            }
            connection.release();
        });
    });
});

router.post('/login/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('admin/admin-main',{nickName: req.body.login_id, listLength : 0 });
});

module.exports = router;
