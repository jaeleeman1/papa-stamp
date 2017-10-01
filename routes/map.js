var express = require('express');
var config = require('../config/service_config');
var router = express.Router();
var getConnection = require('../config/db_connection');
var logger = require('../config/logger');
var request = require("request");
var parser = require("xml2js");
var mysql = require('mysql');

const TAG = "[MAP INFO] ";

// Get map main
router.get('/mapMain/:userId/', function(req, res, next) {
    logger.info(TAG, 'Get map main');

    var userId = req.params.userId;
    logger.debug(TAG, 'User ID : ' + userId);

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid paramete error');
        res.status(400);
        res.send('Invalid parameter error');
    }

    res.render('map/mapMain', {url:config.url, userId:userId});
});

//Get User Location
router.get('/currentLocation', function (req, res, next) {
    logger.info(TAG, 'Get user current location');

    var userId = req.headers.user_id;
    logger.debug(TAG, 'User ID : ' + userId);

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid headers value');
        res.status(400);
        res.send('Invalid headers error');
    }

    getConnection(function (err, connection){
        var selectUserLocationQuery = 'select CURRENT_LAT,CURRENT_LNG from SB_USER_INFO where USER_ID ='+mysql.escape(userId);
        connection.query(selectUserLocationQuery, function (err, currentLocationData) {
            if (err) {
                logger.error(TAG, "DB selectUserLocationQuery error : " + err);
                res.status(400);
                res.send('Select user current location error');
            }else{
                logger.debug(TAG, 'Select user current location success : ' + JSON.stringify(currentLocationData));
                res.status(200);
                res.send({currentLocationData:currentLocationData[0]});
            }
            connection.release();
        });
    });
});

//Get Shop Data
router.get('/shopData', function(req, res, next) {
    logger.info(TAG, 'Get shop data');

    var userId = req.headers.user_id;
    logger.debug(TAG, 'User ID : ' + userId);

    var currentLat = req.query.current_lat;
    var currentLng = req.query.current_lng;

    logger.debug(TAG, 'Current Latitude : ' + currentLat);
    logger.debug(TAG, 'Current Longitude : ' + currentLng);

    if(currentLat == null || currentLat == undefined &&
        currentLng == null || currentLng == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    //Shop Data API
    getConnection(function (err, connection) {
        var selectShopDataQuery = 'select * from SB_SHOP_INFO where SHOP_LAT =' + mysql.escape(currentLat)+ ' and SHOP_LNG =' + mysql.escape(currentLng);
        connection.query(selectShopDataQuery, function (err, shopData) {
            if (err) {
                console.error("Select shop data Error : ", err);
                res.status(400);
                res.send('Select shop data error');
            } else {
                logger.debug(TAG, 'Select shop data success : ' + JSON.stringify(shopData));
                res.status(200);
                res.send({shopData: shopData[0], userId: userId});
            }
        });
    });
});

//Get Shop List
router.get('/shopList', function (req, res, next) {
    logger.info(TAG, 'Get shop list');

    var userId = req.headers.user_id;
    var currentLat = req.query.current_lat;
    var currentLng = req.query.current_lng;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Current Latitude : ' + currentLat);
    logger.debug(TAG, 'Current Longitude : ' + currentLng);

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid headers value');
        res.status(400);
        res.send('Invalid headers error');
    }

    if(currentLat == null || currentLat == undefined ||
        currentLng == null || currentLng == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    //Shop List API
    getConnection(function (err, connection){
        var selectShopListQuery = 'select SSI.SHOP_LAT, SSI.SHOP_LNG, SUPI.USER_STAMP from SB_SHOP_INFO as SSI ' +
            'inner join SB_USER_PUSH_INFO as SUPI on SUPI.SHOP_ID = SSI.SHOP_ID ' +
            'where SSI.DEL_YN = "N" and SUPI.USER_ID =' +mysql.escape(userId);
        connection.query(selectShopListQuery, function (err, shopListData) {
            if (err) {
                console.error("Select shop lIst Error : ", err);
                res.status(400);
                res.send('Select shop lIst error');
            } else {
                logger.debug(TAG, 'Select shop lIst success : ' + JSON.stringify(shopListData));
                res.status(200);
                res.send({shopListData:shopListData});
            }
        });
    });
});

//Put User Location
router.put('/updateLocation', function (req, res, next) {
    logger.info(TAG, 'Update user location');

    var userId = req.headers.user_id;
    var currentLat = req.body.latitude;
    var currentLng = req.body.longitude;
    // var currentLat = req.query.current_lat;
    // var currentLng = req.query.current_lng;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Current Latitude : ' + currentLat);
    logger.debug(TAG, 'Current Longitude : ' + currentLng);

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid headers value');
        res.status(400);
        res.send('Invalid headers error');
    }

    if(currentLat == null || currentLat == undefined ||
        currentLng == null || currentLng == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var updateUserLocationQuery = 'insert into SB_USER_INFO (USER_ID, CURRENT_LAT, CURRENT_LNG) value ("'+ userId +'", "'+ currentLat +'", "' + currentLng +'") ' +
            'on duplicate key update CURRENT_LAT = "'+ currentLat +'", CURRENT_LNG = "'+ currentLng +'"';
        connection.query(updateUserLocationQuery, function (err, userLocationData) {
            if (err) {
                logger.error(TAG, "DB updateUserLocationQuery error : " + err);
                res.status(400);
                res.send('Update user location error');
            }else{
                logger.debug(TAG, 'Update user location success');
                res.status(200);
                res.send();
            }
            connection.release();
        });
    });
});


















module.exports = router;
