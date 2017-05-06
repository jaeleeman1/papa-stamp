var express = require('express');
var config = require('../lib/config');
var router = express.Router();

/* GET home page. */
router.get('/main', function(req, res, next) {
    res.render('bestFoodMain', {url:config.url});
});

module.exports = router;
