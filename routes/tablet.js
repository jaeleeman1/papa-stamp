var express = require('express');
var router = express.Router();
var config = require('../lib/config');
var getConnection = require('../lib/db_connection');
var request = require('request');

/* GET login (session) */
router.get('/main', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{nickName: req.body.login_id, listLength : 0 });
});

router.post('/tablet/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{nickName: req.body.login_id, listLength : 0 });
});

module.exports = router;
