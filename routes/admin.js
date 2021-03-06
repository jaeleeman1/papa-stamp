var express = require('express');
var router = express.Router();
var config = require('../config/service_config');
var getConnection = require('../config/db_connection');
var request = require('request');

/* GET login (session) */
router.get('/init', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('admin/loginMain',{nickName: req.body.login_id, listLength : 0 });
});

router.post('/tablet/mainPage', function(req, res, next) {
    // console.log('login id : ' + req.body.login_id);
    res.render('tablet/tabletMain',{nickName: req.body.login_id, listLength : 0 });
});

module.exports = router;
