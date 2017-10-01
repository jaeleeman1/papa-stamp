var express = require('express');
var router = express.Router();
var config = require('../config/service_config');

const TAG = "[INIT INFO] ";

router.get('/contact/:userId', function(req, res, next) {
    var userId = req.params.userId;

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid paramete error');
        res.status(400);
        res.send('Invalid parameter error');
    }

    res.render('contactUs', {url:config.url, userId:userId});
});

router.get('/error', function(req, res, next) {
    res.render('errorMain', {url:config.url});
});

module.exports = router;
