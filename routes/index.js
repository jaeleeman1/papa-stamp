var express = require('express');
var config = require('../config/service_config');
var router = express.Router();
var getConnection = require('../config/db_connection');
var logger = require('../config/logger');
var request = require("request");
var parser = require("xml2js");
var mysql = require('mysql');

const TAG = "[MAP INFO] ";

// Get papa main
router.get('/main', function(req, res, next) {
    logger.info(TAG, 'Select papa main');

    var userId = '01026181715'//req.headers.user_id;
    logger.debug(TAG, 'User ID : ' + userId);

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid shop id');
        res.status(400);
        res.send('Invalid parameter error');
    }

    res.render('papastampMain', {url:config.url, currentUserId:userId});
});

//Get Current Location
router.get('/currentLocation', function (req, res, next) {
    logger.info(TAG, 'Select user current location');

    var userId = req.headers.user_id;

    logger.debug(TAG, 'User ID : ' + userId);

    if(userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var selectCurrentLocationQuery = 'select CURRENT_LAT,CURRENT_LON from SB_USER_INFO where USER_ID ='+mysql.escape(userId);
        connection.query(selectCurrentLocationQuery, function (err, currentLocationData) {
            if (err) {
                logger.error(TAG, "DB selectCurrentLocationQuery error : " + err);
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
    logger.info(TAG, 'Select shop data');
    var currentLat = req.query.current_lat;
    var currentLon = req.query.current_lon;

    logger.debug(TAG, 'Current Latitude : ' + currentLat);
    logger.debug(TAG, 'Current Longitude : ' + currentLon);

    if(currentLat == null || currentLat == undefined &&
        currentLon == null || currentLon == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    //Shop Data API
    getConnection(function (err, connection) {
        var selectShopDataQuery = 'select * from SB_SHOP_INFO where SHOP_LAT =' + mysql.escape(currentLat)+ ' and SHOP_LON =' + mysql.escape(currentLon);
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

//Get Shop List
router.get('/shopList', function (req, res, next) {
    logger.info(TAG, 'Select shop list');

    var userId = req.headers.user_id;
    var currentLat = req.query.current_lat;
    var currentLon = req.query.current_lon;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Current Latitude : ' + currentLat);
    logger.debug(TAG, 'Current Longitude : ' + currentLon);

    if(userId == null || userId == undefined &&
        currentLat == null || currentLat == undefined &&
        currentLon == null || currentLon == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    //Shop List API
    getConnection(function (err, connection){
        var selectShopListQuery = 'select SSI.*, SUPI.USER_STAMP from SB_SHOP_INFO as SSI ' +
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
        /*var host = 'https://apis.daum.net/local/geo/coord2detailaddr?apikey=076df8cf69c376d5065c3bc99891a438&x='+currentLon+'&y='+currentLat+'&inputCoordSystem=WGS84';
        logger.info(TAG, 'XXXXXXXXXXXXX : ' + host);
        request.get({'url': host}, function (error, req, addrData) {
            if (!error) {
                parser.parseString(addrData, function(err, result) {
                    var addr = '';
                    var addrNew = result.address.new[0].name[0].$.value;
                    if(addrNew == "") {
                        addr = result.address.old[0].name[0].$.value;
                    }else {
                        addr = addrNew;
                    }

                    // var bigAddr = '강남';
                    var startLat = Number(currentLat) - 0.1;
                    var startLon = Number(currentLon) - 0.1;
                    var endLat = Number(currentLat) + 0.1;
                    var endLon = Number(currentLon) + 0.1;

                    // Select Event List
                    // var selectLottoShopQuery = 'select * from SB_EVENT_SHOP where SHOP_LAT between ? and ? and SHOP_LON between ? and ? and DEL_YN = "N" and DESCRIPTION like "' + bigAddr + '%" limit 20;';
                    var selectLottoShopQuery = 'select * from SB_SHOP_INFO where DEL_YN = "N" limit 10;';
                    connection.query(selectLottoShopQuery, [startLat, endLat, startLon, endLon], function (err, row) {
                        if (err) {
                            console.error("[ShopLIst Buy Insert] Select ShopLIst Count Error : ", err);
                            api.error(res);
                        } else {
                            // 현재 주소 가져오기
                            // console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                            res.send({shopData :row, address :addr});
                        }
                    });
                });
            }
        });*/
    });
});

router.get('/contact', function(req, res, next) {
    res.render('contact', {url:config.url});
});

router.get('/error', function(req, res, next) {
    res.render('error', {url:config.url});
});

module.exports = router;
