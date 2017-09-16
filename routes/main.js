var express = require('express');
var config = require('../config/service_config');
var router = express.Router();
var getConnection = require('../config/db_connection');
var logger = require('../config/logger');
var request = require("request");
var parser = require("xml2js");
var mysql = require('mysql');
var admin = require("firebase-admin");
var serviceAccount = require("../config/papastamp-a72f6-firebase-adminsdk-qqp2q-6484dc5daa.json");

const TAG = "[MAP INFO] ";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://papastamp-a72f6.firebaseio.com"
});

// Get firebase admin auth
router.get('/adminAuth', function(req, res, next) {
    logger.info(TAG, 'Select papa main');

    var uId = req.headers.uid;
    logger.debug(TAG, 'User ID : ' + uId);

    if(uId == null || uId == undefined) {
        logger.debug(TAG, 'Invalid headers value');
        res.status(400);
        res.send('Invalid headers error');
    }

    admin.auth().createCustomToken(uid)
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

// Get papa main
router.get('/main', function(req, res, next) {
    logger.info(TAG, 'Select papa main');

    var fId = "0K/TI3hNRoFYJ5qycxcasA==";//req.headers.f_id;
    logger.debug(TAG, 'Firebase ID : ' + fId);

    if(fId == null || fId == undefined) {
        logger.debug(TAG, 'Invalid headers value');
        res.status(400);
        res.send('Invalid headers error');
    }

    res.render('papastampMain', {url:config.url, fId:fId});
});

//Get Shop List
router.get('/shopList', function (req, res, next) {
    logger.info(TAG, 'Select shop list');

    var fId = req.headers.f_id;
    var currentLat = req.query.current_lat;
    var currentLng = req.query.current_lng;

    logger.debug(TAG, 'Firebase ID : ' + fId);
    logger.debug(TAG, 'Current Latitude : ' + currentLat);
    logger.debug(TAG, 'Current Longitude : ' + currentLng);

    if(fId == null || fId == undefined) {
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
            'where SSI.DEL_YN = "N" and SUPI.USER_ID =' +mysql.escape(fId);
        connection.query(selectShopListQuery, function (err, shopListData) {
            if (err) {
                console.error("Select shop lIst Error : ", err);
                res.status(400);
                res.send('Select shop lIst error');
            } else {
                logger.debug(TAG, 'Select shop lIst success : ' + JSON.stringify(shopListData));
                res.status(200);
                res.send({shopListData:shopListData, fId:fId});
            }
        });
    });
});

//Get User Location
router.get('/currentLocation', function (req, res, next) {
    logger.info(TAG, 'Select user current location');

    var fId = req.headers.f_id;
    logger.debug(TAG, 'Firebase ID : ' + fId);

    if(fId == null || fId == undefined) {
        logger.debug(TAG, 'Invalid headers value');
        res.status(400);
        res.send('Invalid headers error');
    }

    getConnection(function (err, connection){
        var selectUserLocationQuery = 'select CURRENT_LAT,CURRENT_LNG from SB_USER_INFO where USER_ID ='+mysql.escape(fId);
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

//Put User Location
router.put('/updateLocation', function (req, res, next) {
    logger.info(TAG, 'Update user location');

    var fId = req.headers.f_id;
    var currentLat = req.query.current_lat;
    var currentLng = req.query.current_lng;

    logger.debug(TAG, 'Firebase ID : ' + fId);
    logger.debug(TAG, 'Current Latitude : ' + currentLat);
    logger.debug(TAG, 'Current Longitude : ' + currentLng);

    if(fId == null || fId == undefined) {
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
        var updateUserLocationQuery = 'update into SB_USER_INFO set CURRENT_LAT = '+ currentLat +', CURRENT_LNG =' + currentLng + 'where USER_ID = '+ userId;
        connection.query(updateUserLocationQuery, function (err, userLocationData) {
            if (err) {
                logger.error(TAG, "DB updateUserLocationQuery error : " + err);
                res.status(400);
                res.send('Update user location error');
            }else{
                logger.debug(TAG, 'Update user location success');
                res.status(200);
            }
            connection.release();
        });
    });
});

//Get Shop Data
router.get('/shopData', function(req, res, next) {
    logger.info(TAG, 'Select shop data');
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
                res.send({shopData: shopData[0]});
            }
        });
    });
});



router.get('/contact', function(req, res, next) {
    res.render('contact', {url:config.url});
});

router.get('/error', function(req, res, next) {
    res.render('error', {url:config.url});
});

module.exports = router;
