var express = require('express');
var config = require('../lib/config');
var router = express.Router();

/* GET home page. */
router.get('/main', function(req, res, next) {
    res.render('papastampMain', {url:config.url});
});

router.get('/contact', function(req, res, next) {
    res.render('contact', {url:config.url});
});

router.get('/error', function(req, res, next) {
    res.render('error', {url:config.url});
});
module.exports = router;
