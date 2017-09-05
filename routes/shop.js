var express = require('express');
var router = express.Router();
var getConnection = require('../config/db_connection');
var mysql = require('mysql');
var config = require('../config/service_config');
var logger = require('../config/logger');

const TAG = "[SHOP INFO] ";

/* Shop Page API */
//Get Shop Information
router.get('/shopInfo', function (req, res, next) {
    logger.info(TAG, 'Select shop information');
    var userId = '01026181715'//req.headers.user_id;
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

        var selectShopUserQuery = 'select SSI.*, SSPI.SHOP_ORDER_NUM from SB_SHOP_INFO as SSI ' +
            'inner join SB_SHOP_PUSH_INFO as SSPI on SSI.SHOP_ID = SSPI.SHOP_ID ' +
            'where SSI.SHOP_ID = '+mysql.escape(shopId) +
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
                        var selectUserQuery = 'select SUPI.USER_CURRENT_NUM, SUPI.USER_STAMP from SB_USER_PUSH_INFO as SUPI where SUPI.SHOP_ID = '+mysql.escape(shopId)+' and SUPI.USER_ID = '+mysql.escape(userId);
                        connection.query(selectUserQuery, function (err, userData) {
                            if (err) {
                                logger.error(TAG, "DB selectUserQuery error : " + err);
                                res.status(400);
                                res.send('Select user info error');
                            }else{
                                logger.debug(TAG, 'Select user info success : ' + JSON.stringify(userData));
                                res.status(200);
                                res.render('shop/shopMain', {url:config.url, shopData:shopdata[0], menuData:menuData, userData:userData[0], pushUserId:userId, pushShopId:shopId});
                            }
                        });
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
        var insertShopPushQuery = 'insert into SB_SHOP_PUSH_INFO (SHOP_ID, SHOP_CURRENT_NUM) value ' +
            '('+mysql.escape(shopId)+', 1) on duplicate key update SHOP_CURRENT_NUM = SHOP_CURRENT_NUM +1';
        connection.query(insertShopPushQuery, function (err, row) {
            if (err) {
                logger.error(TAG, "DB selectShopPushQuery error : " + err);
                res.status(400);
                res.send('Select shop push info error');
            }else{
                logger.debug(TAG, 'insert(update) shop push info Success');
                var selectShopPushQuery = 'select SHOP_CURRENT_NUM from SB_SHOP_PUSH_INFO where SHOP_ID ='+mysql.escape(shopId);
                connection.query(selectShopPushQuery, function (err, shopPushData) {
                    if (err) {
                        logger.error(TAG, "DB selectShopPushQuery error : " + err);
                        res.status(400);
                        res.send('Select shop push info error');
                    } else {
                        logger.debug(TAG, 'Select shop push info Success');
                        var shopCurrentNum = shopPushData[0].SHOP_CURRENT_NUM;
                        logger.debug(TAG, 'Shop current number : ' + shopCurrentNum);
                        // Insert user push information
                        var insertUserPushQuery = 'insert into SB_USER_PUSH_INFO (SHOP_ID, USER_ID, USER_CURRENT_NUM, USER_STAMP) value (' + mysql.escape(shopId) + ',' + mysql.escape(userId) +
                            ', ' + shopCurrentNum + ', 1) on duplicate key update USER_CURRENT_NUM = ' + shopCurrentNum + ', USER_STAMP = USER_STAMP +1';
                        connection.query(insertUserPushQuery, function (err, userPushData) {
                            if (err) {
                                logger.error(TAG, "DB insertUserPushQuery error : " + err);
                                res.status(400);
                                res.send('Insert user push info error');
                            } else {
                                logger.debug(TAG, 'Insert user push info success');
                                res.status(200);
                                res.send({resultData:'Insert user info success'});
                            }
                        });
                    }
                });
            }
            connection.release();
        });
    });
});

//Put Insert Shop Order Number
router.put('/insertShopOrderNumber', function (req, res, next) {
    logger.info(TAG, 'Insert user stamp history');
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
        var insertShopOrderNumberQuery = 'insert into SB_SHOP_PUSH_INFO (SHOP_ID, SHOP_ORDER_NUM) value ' +
            '('+mysql.escape(shopId)+', 0) on duplicate key update SHOP_ORDER_NUM = SHOP_ORDER_NUM +1';
        connection.query(insertShopOrderNumberQuery, function (err, row) {
            if (err) {
                logger.error(TAG, "DB insertShopOrderNumberQuery error : " + err);
                res.status(400);
                res.send('Insert shop order number error');
            }else{
                logger.debug(TAG, 'Insert shop order number success');
                res.status(200);
                res.send({resultData:'Insert shop order number success'});
            }
            connection.release();
        });
    });
});

//Get Select Stamp History
router.get('/selectStampDate', function(req, res) {
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
        var selectStampPushCount = 'select date_format(REG_DT, "%y/%m/%d") as REG_DT from SB_USER_PUSH_HIS where USED_YN = "N" and SHOP_ID = '+mysql.escape(shopId)+' and USER_ID = '+mysql.escape(userId);
        connection.query(selectStampPushCount, function (err, stampPushData) {
            if (err) {
                logger.error(TAG, "DB selectStampPushCount error : " + err);
                res.status(400);
                res.send('Select stamp push count error');
            }else{
                logger.debug(TAG, 'Select stamp push count success : ' + JSON.stringify(stampPushData));
                res.status(200);
                res.send({stampPushData:stampPushData});
            }
            connection.release();
        });
    });
});


/*//Put Update Push History
router.put('/updatePushHistory', function (req, res, next) {
    logger.info(TAG, 'Update push history');
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
        var updatePushHistory = 'update SB_USER_PUSH_HIS set USED_YN = "Y" where  SHOP_ID = '+mysql.escape(shopId)+' and USER_ID = '+mysql.escape(userId)+' and USED_YN = "N" order by REG_DT ASC limit 10';
        connection.query(updatePushHistory, function (err, UpdateCouphoneData) {
            if (err) {
                logger.error(TAG, "DB updatePushHistory error : " + err);
                res.status(400);
                res.send('Update push history error');
            }else{
                logger.debug(TAG, 'Update push history success');
                res.status(200);
                res.send({resultData:'Update push history success'});
            }
            connection.release();
        });
    });
});*/

/*//Put Couphone Mapping
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
                res.send({resultData:'Update couphone mapping success'});
            }
            connection.release();
        });
    });
});*/

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

module.exports = router;

