var express = require('express');
var router = express.Router();
var getConnection = require('../config/db_connection');
var mysql = require('mysql');
var config = require('../config/service_config');
var logger = require('../config/logger');
var request = require("request");
var cheerio = require("cheerio");
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var redis   = require('redis');
var publisherClient = redis.createClient();

const TAG = "[SHOP INFO] ";

/* Shop Page API */
//Get Shop Information
router.get('/shopInfo', function (req, res, next) {
    logger.info(TAG, 'Select shop information');
    var userId = req.headers.user_id;
    var shopId = req.query.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined) {
        logger.debug(TAG, 'Invalid shop id');
        res.status(400);
        res.send('Invalid parameter error');
    }

    // Select shop&user info
    getConnection(function (err, connection){
        if(userId == null || userId == undefined ){
            logger.debug(TAG, 'Invalid user id (no stamp push)');
            userId = '01000000000';
        }

        var selectShopUserQuery = 'select SSI.*, SSPI.SHOP_CURRENT_NUM, SUPI.USER_CURRENT_NUM, SUPI.USER_STAMP from SB_SHOP_INFO as SSI ' +
            'inner join SB_SHOP_PUSH_INFO as SSPI on SSI.SHOP_ID = SSPI.SHOP_ID ' +
            'inner join SB_USER_PUSH_INFO as SUPI on SSPI.SHOP_ID = SUPI.SHOP_ID ' +
            'where SSI.SHOP_ID = '+mysql.escape(shopId)+' and SUPI.USER_ID = '+mysql.escape(userId) +
            'order by SSPI.UPDATE_DT DESC limit 1';

        connection.query(selectShopUserQuery, function (err, shopdata) {
            if (err) {
                logger.error(TAG, "DB selectShopUserQuery error : " + err);
                res.status(400);
                res.send('Select shop info error');
            }else{
                logger.debug(TAG, 'Select shop info Success : ' + JSON.stringify(shopdata));
                var selectMenuQuery = 'select SSM.* from SB_SHOP_MENU as SSM where SSM.MENU_TYPE = "Espresso" and SSM.SHOP_ID = '+mysql.escape(shopId);
                connection.query(selectMenuQuery, function (err, menuData) {
                    if (err) {
                        logger.error(TAG, "DB selectMenuQuery error : " + err);
                        res.status(400);
                        res.send('Select shop menu error');
                    }else{
                        logger.debug(TAG, 'Select shop menu success : ' + JSON.stringify(menuData));
                        res.status(200);
                        res.render('shop/shopMain', {url:config.url, shopData:shopdata[0], menuData:menuData, pushUserId:userId, pushShopId:shopId});
                    }
                });
            }
            connection.release();
        });
    });
});

//Get Shop Detail Menu
router.get('/shopDetailMenu', function (req, res, next) {
    logger.info(TAG, 'Select shop menu');

    var shopId = req.query.shop_id;
    var menuType = req.query.menu_type;

    logger.debug(TAG, 'Shop ID : ' + shopId);
    logger.debug(TAG, 'Menu Type : ' + menuType);

    if(shopId == null || shopId == undefined &&
        menuType == null || menuType == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    // Select menu
    getConnection(function (err, connection){
        var selectMenuQuery = 'select SSM.* from SB_SHOP_MENU as SSM where SSM.SHOP_ID = '+mysql.escape(shopId)+' and SSM.MENU_TYPE = '+mysql.escape(menuType);
        connection.query(selectMenuQuery, function (err, menuData) {
            if (err) {
                logger.error(TAG, "DB selectMenuQuery error : " + err);
                res.status(400);
                res.send('Select shop menu error');
            }else{
                logger.debug(TAG, 'Select shop menu success : ' + JSON.stringify(menuData));
                res.status(200);
                res.send({menuData:menuData});
            }
            connection.release();
        });
    });
});

//Post Push Stamp
router.post('/update-stamp', function(req, res) {
    logger.info(TAG, 'Update!!!');
    var userId = req.headers.user_id;
    var shopId = req.body.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        // Select shop push information
        var insertShopPushQuery = 'insert into SB_SHOP_PUSH_INFO (SHOP_ID, SHOP_ORDER_NUM, SHOP_CURRENT_NUM) value ' +
            '('+mysql.escape(shopId)+', 1, 0) on duplicate key update SHOP_ORDER_NUM = SHOP_ORDER_NUM +1';
        connection.query(insertShopPushQuery, function (err, row) {
            if (err) {
                logger.error(TAG, "DB selectShopPushQuery error : " + err);
                res.status(400);
                res.send('Select shop push info error');
            }else{
                logger.debug(TAG, 'insert(update) shop push info Success');
                var selectShopPushQuery = 'select SHOP_ORDER_NUM from SB_SHOP_PUSH_INFO where SHOP_ID ='+mysql.escape(shopId);
                connection.query(selectShopPushQuery, function (err, shopPushData) {
                    if (err) {
                        logger.error(TAG, "DB selectShopPushQuery error : " + err);
                        res.status(400);
                        res.send('Select shop push info error');
                    } else {
                        logger.debug(TAG, 'Select shop push info Success');
                        var shopOrderNum = shopPushData[0].SHOP_ORDER_NUM;
                        logger.debug(TAG, 'Shop order number : ' + shopOrderNum);
                        // Insert user push information
                        var insertUserPushQuery = 'insert into SB_USER_PUSH_INFO (SHOP_ID, USER_ID, USER_CURRENT_NUM, USER_STAMP) value (' + mysql.escape(shopId) + ',' + mysql.escape(userId) +
                            ', ' + shopOrderNum + ', 1) on duplicate key update USER_CURRENT_NUM = ' + shopOrderNum + ', USER_STAMP = USER_STAMP +1';
                        connection.query(insertUserPushQuery, function (err, userPushData) {
                            if (err) {
                                logger.error(TAG, "DB insertUserPushQuery error : " + err);
                                res.status(400);
                                res.send('Insert user push info error');
                            } else {
                                logger.debug(TAG, 'Insert user push info success');
                                res.status(200);
                                res.send('Insert user info success');
                            }
                        });
                    }
                });
            }
            connection.release();
        });
    });
});

//Put Insert Stamp History
router.put('/insertStampHistory', function (req, res, next) {
    logger.info(TAG, 'Insert user stamp history');
    var userId = req.headers.user_id;
    var shopId = req.query.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var insertStampHistory = 'insert into SB_USER_PUSH_HIS (SHOP_ID, USER_ID) value ('+mysql.escape(shopId)+', '+mysql.escape(userId)+')';
        connection.query(insertStampHistory, function (err, row) {
            if (err) {
                logger.error(TAG, "DB insertStampHistory error : " + err);
                res.status(400);
                res.send('Insert user push history error');
            }else{
                logger.debug(TAG, 'Insert user push history success');
                res.status(200);
                res.send('Insert user push history success');
            }
            connection.release();
        });
    });
});

//Get User Push Count
router.get('/validateCouphone', function(req, res) {
    logger.info(TAG, 'Select user push count');
    var userId = req.headers.user_id;
    var shopId = req.query.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var selectUserPushCount = 'select count(*) from SB_USER_PUSH_HIS where DEL_YN = "N" and SHOP_ID = '+mysql.escape(shopId)+' and USER_ID = '+mysql.escape(userId)+')';
        connection.query(selectUserPushCount, function (err, userPushData) {
            if (err) {
                logger.error(TAG, "DB selectUserPushCount error : " + err);
                res.status(400);
                res.send('Select user push count error');
            }else{
                logger.debug(TAG, 'Select user push count success : ' + JSON.stringify(userPushData));
                res.status(200);
                res.send({userPushData:userPushData});
            }
            connection.release();
        });
    });
});

//Put Couphone Mapping
router.put('/updateCouphoneMapping', function (req, res, next) {
    logger.info(TAG, 'Update couphone mapping');
    var userId = req.headers.user_id;
    var shopId = req.body.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var updateCouphoneMapping = 'update SB_USER_COUPHONE SET USER_ID = '+mysql.escape(userId)+', MAPPING_YN = "Y"' +
            'where MAPPING_YN = "N" and USED_YN = "N" and SHOP_ID = '+mysql.escape(shopId)+' order by REG_DT ASC limit 1';
        connection.query(updateCouphoneMapping, function (err, UpdateCouphoneData) {
            if (err) {
                logger.error(TAG, "DB updateCouphoneMapping error : " + err);
                res.status(400);
                res.send('Update couphone mapping error');
            }else{
                logger.debug(TAG, 'Update couphone mapping success');
                res.status(200);
                res.send('Update couphone mapping success');
            }
            connection.release();
        });
    });
});

//Get Couphone Number
router.get('/couphoneInfo', function (req, res, next) {
    logger.info(TAG, 'Select shop couphone info');

    var userId = req.headers.user_id;
    var shopId = req.query.shop_id;

    logger.debug(TAG, 'User ID : ' + userId);
    logger.debug(TAG, 'Shop ID : ' + shopId);

    if(shopId == null || shopId == undefined &&
        userId == null || userId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    getConnection(function (err, connection){
        var selectCouphoneInfoQuery = 'select COUPHONE_NUMBER, EXPIRATION_DT, COUPHONE_IMG, COUPHONE_PRICE from SB_USER_COUPHONE ' +
            'where MAPPING_YN = "Y" and USED_YN = "N" and SHOP_ID = '+mysql.escape(shopId)+' and USER_ID = '+mysql.escape(userId)+' order by REG_DT ASC';
        console.log('XXXXX : ' + selectCouphoneInfoQuery)
        connection.query(selectCouphoneInfoQuery, function (err, shopCouphoneData) {
            if (err) {
                logger.error(TAG, "DB selectCouphoneInfoQuery error : " + err);
                res.status(400);
                res.send('Select shop couphone info error');
            }else{
                logger.debug(TAG, 'Select shop couphone info success : ' + JSON.stringify(shopCouphoneData));
                res.status(200);
                res.send({shopCouphoneData:shopCouphoneData});
            }
            connection.release();
        });
    });
});

//Post Create Couphone
router.post('/createCouphone', function (req, res, next) {
    logger.info(TAG, 'Insert couphone');
    var shopId = req.query.shop_id;
    var couphoneNumber = req.body.couphone_number;
    var expirationDate = req.body.expiration_date;
    var couphonePrice = req.body.couphone_price;

    logger.debug(TAG, 'Shop ID : ' + shopId);
    logger.debug(TAG, 'Couphone Number : ' + couphoneNumber);
    logger.debug(TAG, 'Expiration Date : ' + expirationDate);
    logger.debug(TAG, 'Couphone Price : ' + couphonePrice);

    if(shopId == null || shopId == undefined) {
        logger.debug(TAG, 'Invalid parameter');
        res.status(400);
        res.send('Invalid parameter error');
    }

    if(couphoneNumber == null || couphoneNumber == undefined &&
        expirationDate == null || expirationDate == undefined &&
        couphonePrice == null || couphonePrice == undefined) {
        logger.debug(TAG, 'Invalid body value');
        res.status(400);
        res.send('Invalid body value error');
    }

    getConnection(function (err, connection){
        var insertCouphoneQuery = 'insert into SB_USER_COUPHONE (SHOP_ID, COUPHONE_NUMBER, COUPHONE_PRICE, EXPIRATION_DT) values ("' + shopId + '", "' + couphoneNumber + '", "' + couphonePrice + '", "' + expirationDate + '")';
        connection.query(insertCouphoneQuery, function (err, couphoneData) {
            if (err) {
                logger.error(TAG, "DB insertCouphoneQuery error : " + err);
                res.status(400);
                res.send('Insert couphone Error');
            }else{
                logger.debug(TAG, 'Insert couphone success');
                res.status(200);
                res.send('Insert couphone success');
            }
            connection.release();
        });
    });
});

router.get('/update-stream/:shop_id/:event_name', function(req, res) {
    // let request last as long as possible
    req.socket.setTimeout(Number.MAX_VALUE);

    var shopID = req.params.shop_id;
    var userID = '01026181715';
    var sendType = "phone"; //tablet
    // console.log('x ', req.params.shop_id);

    /*    var userCurrentNum = 0;
     getConnection(function (err, connection){
     // Select Event List
     var selectUserCount = 'select SUPI.USER_CURRENT_NUM from SB_USER_PUSH_INFO as SUPI where SUPI.SHOP_ID = ? and SUPI.USER_ID = ?';

     var selectShopCount = 'select SSPI.SHOP_CURRENT_NUM, SUPI.USER_CURRENT_NUM from SB_SHOP_PUSH_INFO as SSPI ' +
     'inner join SB_USER_PUSH_INFO as SUPI on SSPI.SHOP_ID = SUPI.SHOP_ID ' +
     'where SSPI.SHOP_ID = ? and SUPI.USER_ID = ? ';
     connection.query(selectUserCount, [shopID, userID], function (err, row) {
     if (err) {
     console.error("@@@ [Shop List] Select Shop Count Error : " + err);
     throw err;
     }else{
     // console.log("### [Shop List] Select Shop Count Success ### " + JSON.stringify(row));
     userCurrentNum = row[0].USER_CURRENT_NUM;
     }
     connection.release();
     });
     });*/

    var subscriber = redis.createClient();

    subscriber.subscribe(shopID);

    // In case we encounter an error...print it out to the console
    subscriber.on("error", function(err) {
        console.log("Redis Error: " + err);
    });

    // When we receive a message from the redis connection
    subscriber.on("message", function(channel, message) {


        var userStampNum = 0;
        /*        getConnection(function (err, connection){
         // Select Event List
         var updateUserStampQuery = 'update SB_USER_PUSH_INFO SET USER_STAMP = USER_STAMP +1 where SHOP_ID = ? and USER_ID = ?';
         connection.query(updateUserStampQuery, [shopID, userID], function (err, row) {
         if (err) {
         console.error("@@@ [Shop List] Select Shop Count Error : " + err);
         throw err;
         }else{
         var selectUserStampQuery = 'select USER_STAMP from SB_USER_PUSH_INFO where SHOP_ID = ? and USER_ID = ?';
         connection.query(selectUserStampQuery, [shopID, userID], function (err, row) {
         if (err) {
         console.error("@@@ [Shop List] Select Shop Count Error : " + err);
         throw err;
         } else {
         // console.log("### [Shop List] Select Shop Count Success ### " + JSON.stringify(row));
         userStampNum = row[0].USER_STAMP;
         }
         // console.log("### [Shop List] Select Shop Count Success ### " + JSON.stringify(row));
         });
         }
         connection.release();
         });
         });*/
        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX : ' + userStampNum);
        // console.log('count : ', userCurrentNum);

        /*getConnection(function (err, connection){
         // Select Event List
         var updateShopCount='update SB_SHOP_PUSH_INFO SET SHOP_CURRENT_NUM = SHOP_CURRENT_NUM +1 where SHOP_ID = ?';
         connection.query(updateShopCount, shopID, function (err, row) {
         if (err) {
         console.error("@@@ [Shop List] Select Shop Count Error : " + err);
         throw err;
         }else{
         getConnection(function (err, connection){
         // Select User Visit Count
         var updateUserVisitCount='';
         if(sendType == "phone") {
         updateUserVisitCount = 'update SB_USER_PUSH_INFO SET USER_CURRENT_NUM = '+ userCurrentNum +', USER_STAMP = USER_STAMP +1 where SHOP_ID = ? and USER_ID = ?';
         }else if(sendType == "tablet") {
         updateUserVisitCount = 'update SB_USER_PUSH_INFO SET USER_CURRENT_NUM = '+ userCurrentNum +' where SHOP_ID = ? and USER_ID = ?';
         }
         var updateUserVisitCount = 'update SB_USER_PUSH_INFO SET USER_STAMP = '+ userCurrentNum +' where SHOP_ID = ? and USER_ID = ?';
         connection.query(updateUserVisitCount, [shopID, userID], function (err, row) {
         if (err) {
         console.error("@@@ [shop List] Update User Visit Count Error : " + err);
         throw err;
         }else{
         console.log("### [shop List] Update User Visit Count Success ### " + JSON.stringify(row));
         }
         });
         });
         console.log("### [Shop List] Select Shop Count Success ### " + JSON.stringify(row));
         }
         connection.release();
         });
         });*/

        res.write('id: ' + userStampNum + '\n');
        res.write("data: " + message + '\n\n'); // Note the extra newline
    });

    //send headers for event-stream connection
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    // The 'close' event is fired when a user closes their browser window.
    // In that situation we want to make sure our redis channel subscription
    // is properly shut down to prevent memory leaks...and incorrect subscriber
    // counts to the channel.
    req.on("close", function() {
        subscriber.unsubscribe();
        subscriber.quit();
    });
});

router.get('/fire-event/:shop_id/:user_id', function(req, res) {
    // console.log('shop_id : ', req.params.shop_id);
    var shopID = req.params.shop_id;
    var userID = req.params.user_id;
    publisherClient.publish( shopID, ('"[' + userID + ']번님" 쿠폰이 발급 되었습니다.') );

    getConnection(function (err, connection){
        // Select Event List
        var updateUserStampQuery = 'update SB_USER_PUSH_INFO SET USER_STAMP = USER_STAMP +1 where SHOP_ID = ? and USER_ID = ?';
        connection.query(updateUserStampQuery, [shopID, userID], function (err, row) {
            if (err) {
                console.error("@@@ [Shop List] Select Shop Count Error : " + err);
                throw err;
            }else{
                var selectUserStampQuery = 'select USER_STAMP from SB_USER_PUSH_INFO where SHOP_ID = ? and USER_ID = ?';
                connection.query(selectUserStampQuery, [shopID, userID], function (err, row) {
                    if (err) {
                        console.error("@@@ [Shop List] Select Shop Count Error : " + err);
                        throw err;
                    } else {
                        // console.log("### [Shop List] Select Shop Count Success ### " + JSON.stringify(row));
                        userStampNum = row[0].USER_STAMP;
                    }
                    // console.log("### [Shop List] Select Shop Count Success ### " + JSON.stringify(row));
                });
            }
            connection.release();
        });
    });

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('All clients have received "' + userID + '"');
    res.end();
});


module.exports = router;

