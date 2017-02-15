var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var config = require('../lib/config');
var api = require("../lib/api");

//GET Shopping List
router.get('/', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.query.nick_name; // wechat Id
        var openId = '';
        var buyData = '';
        var buyPrdctCnt;
        var buyPrdctSumPrice = 0;
        // Select Shopping List
        var shoppingQuery = 'select TSL.* from TB_SHOPPING_LIST AS TSL';
        connection.query(shoppingQuery, wechatId, function (err, listRow) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("### Shopping List ###");
                //console.log("### Data Success ### " + JSON.stringify(buyData));
                // Select Open ID
                var selectQuery = 'select TUI.USER_OPEN_ID from TB_USER_INFO as TUI where TUI.USER_WECHAT_ID = ?';
                connection.query(selectQuery, wechatId, function (err, row) {
                    if (err) {
                        console.error("err : " + err);
                        throw err;
                    }else{
                        openId = row[0].USER_OPEN_ID;
                        console.log("### Open ID ###");
                        //console.log("### Data Success ### " + JSON.stringify(openId));

                        // Shopping Buy Sum
                        var sumQuery = 'select * from TB_SHOPPING_BUY_LIST as TSBL where TSBL.DEL_YN = "N" AND TSBL.USER_WECHAT_ID = ?';
                        connection.query(sumQuery, wechatId, function (err, row) {
                            if (err) {
                                console.error("err : " + err);
                                throw err;
                            }else{
                                buyPrdctCnt = row.length;
                                for(var i=0; i<buyPrdctCnt; i++) {
                                    buyPrdctSumPrice += (row[i].SHOPPING_CNT * row[i].PRICE);
                                }
                                console.log("### Shopping Buy Sum ###");
                                //console.log("### Data Success ### " + JSON.stringify(buyPrdctSumPrice));

                                // Select Shopping Buy List
                                var buyQuery = 'select * from TB_SHOPPING_LIST as TSL, TB_SHOPPING_BUY_LIST as TSBL where TSBL.DEL_YN = "N" AND TSL.PRDCT_ID = TSBL.PRDCT_ID and TSBL.USER_WECHAT_ID = ?';
                                connection.query(buyQuery, wechatId, function (err, buyRow) {
                                    if (err) {
                                        console.error("err : " + err);
                                        throw err;
                                    }else{
                                        buyData = buyRow;
                                        console.log("### Shopping Buy List ###");
                                        //console.log("### Data Success ### " + JSON.stringify(row));
                                        res.render('shopping/shoppingList', {data:listRow, url:config.url, wechatId:wechatId, buyData:buyData, openId:openId, buyCnt: buyPrdctCnt, buySumPrice: buyPrdctSumPrice, dataCheck: 0});
                                    }
                                });
                            }
                        });
                    }
                });
            }
            connection.release();
        });
    });
});

//GET Shopping Empty
router.get('/shoppingEmpty', function (req, res, next) {
    res.render('shopping/shoppingEmpty');
});

//GET Shopping Detail
router.get('/shoppingDetail', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.query.wechat_id; // wechat Id
        var prdctId = req.query.prdct_id; // product Id

        // Select Shopping Detail
        var detailQuery = 'select * from TB_SHOPPING_LIST AS TSL where TSL.PRDCT_ID = ?';
        connection.query(detailQuery, prdctId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("### Shopping Detail ###");
                //console.log("### Data Success ### " + JSON.stringify(row));
                res.render('shopping/shoppingDetail', {data:row[0], wechatId:wechatId});
            }
            connection.release();
        });
    });
});

//GET Shopping Buy Insert
router.post('/shoppingBuyInsert', function (req, res, next) {
    getConnection(function (err, connection){
        console.log('Shopping Buy Insert');

        var wechatId = req.body.wechat_id; // wechat Id
        var prdctId = req.body.prdct_id; // product Id
        var prdctNm = req.body.prdct_nm; // product nm
        var price = req.body.price; // product price
        var image = req.body.image; // image
        var prdctCnt = req.body.prdct_cnt; // product count

        var existsQuery = 'select exists (select * from TB_SHOPPING_BUY_LIST where USER_WECHAT_ID="'+ wechatId+ '" and PRDCT_ID=?) as DATA_CHECK';
        connection.query(existsQuery, prdctId, function (err, row) {
            var dataCheck;
            var addCount;
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var countQuery = 'select SHOPPING_CNT from TB_SHOPPING_BUY_LIST where USER_WECHAT_ID="'+ wechatId+ '" and PRDCT_ID=?';
                    connection.query(countQuery, prdctId, function (err, row) {
                        if (err) {
                            console.error("err : " + err);
                            throw err;
                        }else{
                            console.log("### Select Shopping Count ###");
                            //console.log("### Data Success ### " + JSON.stringify(row));
                            prdctCnt = Number(prdctCnt) + Number(row[0].SHOPPING_CNT);

                            // Insert Buy List
                            var insertQuery = 'insert into TB_SHOPPING_BUY_LIST (USER_WECHAT_ID, PRDCT_ID, PRDCT_NM, PRICE, IMG_URL, SHOPPING_CNT) values ("' + wechatId + '"' +  ', ?' + ', "' + prdctNm + '", ' + price + ', "' + image + '", ' + prdctCnt + ') on DUPLICATE KEY update SHOPPING_CNT = '+ prdctCnt;
                            connection.query(insertQuery, prdctId, function (err, row) {
                                if (err) {
                                    console.error("err : " + err);
                                    throw err;
                                }else{
                                    console.log("### Insert Buy List ###");
                                    //console.log("### Data Success ### " + JSON.stringify(row));

                                    res.send({dataCheck:dataCheck});
                                }
                            });
                        }
                    });
                }else {
                    var insertQuery = 'insert into TB_SHOPPING_BUY_LIST (USER_WECHAT_ID, PRDCT_ID, PRDCT_NM, PRICE, IMG_URL, SHOPPING_CNT) values ("' + wechatId + '"' +  ', ?' + ', "' + prdctNm + '", ' + price + ', "' + image + '", ' + prdctCnt + ') on DUPLICATE KEY update SHOPPING_CNT = '+ prdctCnt;
                    connection.query(insertQuery, prdctId, function (err, row) {
                        if (err) {
                            console.error("err : " + err);
                            throw err;
                        }else{
                            console.log("### Insert Buy List ###");
                            //console.log("### Data Success ### " + JSON.stringify(row));

                            res.send({dataCheck:dataCheck});
                        }
                    });
                }
            }
            connection.release();
        });
    });
});

//GET Shopping Detail Insert
router.post('/shoppingDetailInsert', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.body.wechat_id; // wechat Id
        var prdctId = req.body.prdct_id; // product Id
        var price = req.body.price; // product price
        var image = req.body.image; // image
        var prdctCnt = req.body.prdct_cnt; // product count

        var existsQuery = 'select exists (select * from TB_SHOPPING_BUY_LIST where USER_WECHAT_ID="'+ wechatId+ '" and PRDCT_ID=?) as DATA_CHECK';
        connection.query(existsQuery, prdctId, function (err, row) {
            var dataCheck;
            var addCount;
            if (err) {
                console.error("err : " + err);
                throw err;
            }else {
                dataCheck = row[0].DATA_CHECK;
                if (dataCheck == 1) {
                    var countQuery = 'select SHOPPING_CNT from TB_SHOPPING_BUY_LIST where USER_WECHAT_ID="'+ wechatId+ '" and PRDCT_ID=?';
                    connection.query(countQuery, prdctId, function (err, row) {
                        if (err) {
                            console.error("err : " + err);
                            throw err;
                        }else {
                            console.log("### Select Shopping Count ###");
                            //console.log("### Data Success ### " + JSON.stringify(row));
                            prdctCnt = Number(prdctCnt) + Number(row[0].SHOPPING_CNT);

                            // Insert Buy List
                            var insertQuery = 'insert into TB_SHOPPING_BUY_LIST (USER_WECHAT_ID, PRDCT_ID, PRDCT_NM, PRICE, IMG_URL, SHOPPING_CNT) values ("' + wechatId + '"' + ', ?' + ', "' + prdctNm + '", ' + price + ', "' + image + '", ' + prdctCnt + ') on DUPLICATE KEY update SHOPPING_CNT = ' + prdctCnt;
                            connection.query(insertQuery, prdctId, function (err, row) {
                                if (err) {
                                    console.error("err : " + err);
                                    throw err;
                                } else {
                                    console.log("### Insert Buy List ###");
                                    //console.log("### Data Success ### " + JSON.stringify(row));
                                    //res.redirect('/shopping/shoppingDetail?wechat_id=' + wechatId + '&prdct_id=' + prdctId + '&toastStatus=show');
                                }
                            });
                        }
                    });
                } else {
                    // Insert Buy List
                    var insertQuery = 'insert into TB_SHOPPING_BUY_LIST (USER_WECHAT_ID, PRDCT_ID, PRDCT_NM, PRICE, IMG_URL, SHOPPING_CNT) values ("' + wechatId + '"' + ', ?' + ', "' + prdctNm + '", ' + price + ', "' + image + '", ' + prdctCnt + ') on DUPLICATE KEY update SHOPPING_CNT = ' + prdctCnt;
                    connection.query(insertQuery, prdctId, function (err, row) {
                        if (err) {
                            console.error("err : " + err);
                            throw err;
                        } else {
                            console.log("### Insert Buy List ###");
                            //console.log("### Data Success ### " + JSON.stringify(row));
                            //res.redirect('/shopping/shoppingDetail?wechat_id=' + wechatId + '&prdct_id=' + prdctId + '&toastStatus=show');
                        }
                    });
                }
            }
            connection.release();
        });
    });
});

//GET Shopping Buy List
router.get('/shoppingBuyList', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.query.wechat_id; // wechat Id
        // var prdctId = req.query.prdct_id; // product Id
        // var price = req.query.price; // product price
        // var image = req.query.image; // image
        // var prdctCnt = req.query.prdct_cnt; // product count
        var openId = '';

	    // if(prdctId != '' || prdctId != null) {
         //    if(prdctCnt == '' || prdctCnt == null || prdctCnt == undefined) {
         //        prdctCnt = 1;
         //    }
			
	        // Insert Buy List
            // var insertQuery = 'insert into TB_SHOPPING_BUY_LIST (USER_WECHAT_ID, PRDCT_ID, PRICE, IMG_URL, SHOPPING_CNT) values ("' + wechatId + '"' +  ', ?' + ', ' + price + ', "' + image + '", ' + prdctCnt + ') on DUPLICATE KEY update SHOPPING_CNT = '+ prdctCnt;
            // connection.query(insertQuery, prdctId, function (err, row) {
             //    if (err) {
	    		//     console.error("err : " + err);
		    	//     throw err;
             //    }else{
             //        console.log("### Insert Buy List ###");
             //        //console.log("### Data Success ### " + JSON.stringify(row));

                    // Select Open ID
        var openIdQuery = 'select USER_OPEN_ID from TB_USER_INFO as TUI where USER_WECHAT_ID = ?';
        connection.query(openIdQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                openId = row[0].USER_OPEN_ID;
                console.log("### Select Open ID ###");
                //console.log("### Data Success ### " + JSON.stringify(openId));

                var buyQuery = 'select * from TB_SHOPPING_LIST as TSL, TB_SHOPPING_BUY_LIST as TSBL where TSBL.DEL_YN = "N" and TSL.PRDCT_ID = TSBL.PRDCT_ID and USER_WECHAT_ID = ?';
                // Select Buy List
                connection.query(buyQuery, wechatId, function (err, row) {
                    if (err) {
                        console.error("err : " + err);
                        throw err;
                    }else{
                        console.log("### Shopping Buy List ###");
                        //console.log("### Data Success ### " + JSON.stringify(row));

                        res.render('shopping/shoppingBuyList', {data:row, wechatId:wechatId, url:config.url, openId:openId});
                    }

                });
            }
            connection.release();
        });
        //          }

        //     })
        // }
    });
});

//GET Shopping Setting
// router.get('/shoppingSetting', function (req, res, next) {
//     var wechatId = req.query.wechat_id; // wechat Id
//     var prdctId = req.query.prdct_id; // product Id
//     var image = req.query.image; // image
//     var prdctCnt = req.query.prdct_cnt; // product count
//     var price = req.query.price; // product price
//
//     if(prdctCnt == '') {
//         prdctCnt = 1;
//     }
//     console.log("### Shopping Setting ###");
//     res.render('shopping/shoppingSetting', {wechatId: wechatId, prdctId: prdctId, image: image, prdctCnt: prdctCnt, price: price});
// });

//GET Shopping Delete Product
router.post('/shoppingDeleteProduct', function (req, res, next) {
    getConnection(function (err, connection) {
        var wechatId = req.body.wechat_id; // wechat_id
        var prdctId = req.body.prdct_id; // prdct_id
        // Delete Shopping Buy Product
        var deleteQuery = 'delete from TB_SHOPPING_BUY_LIST where PRDCT_ID ="'+ prdctId + '" and USER_WECHAT_ID = ?';
        connection.query(deleteQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                console.log("### Delete Shopping Buy Product ###");
                //console.log("### Data Success ### " + JSON.stringify(row));
                //res.redirect('/shopping/shoppingBuyList?wechat_id=' + wechatId);
            }
            connection.release();
        });
    });
});

//GET Shopping Delete All
router.post('/shoppingDeleteAll', function (req, res, next) {
    getConnection(function (err, connection) {
        var wechatId = req.body.wechat_id; // wechat_id

	    // Delete Shopping Buy List
        var deleteQuery = 'delete from TB_SHOPPING_BUY_LIST where USER_WECHAT_ID = ?';
        connection.query(deleteQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                console.log("### Delete Shopping Buy List ###");
				//console.log("### Data Success ### " + JSON.stringify(row));		
                res.send({wechatId: wechatId});
            }
            connection.release();
        });
    });
});

//GET Shopping History
router.post('/shoppingInsertHistory', function (req, res, next) {
    getConnection(function (err, connection) {
	    var ProductSet = req.body;
        var wechatId = ProductSet.Wechat_Id; // wechat_id
	    var prdctNm = ProductSet.Prdct_Nm; // product Id
        var prdctCnt = ProductSet.Prdct_Cnt; // product count

	    // Insert Shopping Buy History
        var historyQuery = 'insert into TB_SHOPPING_BUY_HIS (USER_WECHAT_ID, BUY_PRDCT_NM, BUY_SHOPPING_CNT) values ("' + wechatId + '", "' +  prdctNm + '", ' + prdctCnt + ')';

        connection.query(historyQuery, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                console.log("### Insert Shopping Buy History ###");
				//console.log("### Data Success ### " + JSON.stringify(row));		
                res.send({wechatId: wechatId});
            }
            connection.release();
        });
    });
});

//GET Shopping Buy Sum
router.get('/shoppingBuySum', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.query.wechat_id; // wechat Id
        var prdctId = req.query.prdct_id; // product Id
        var price = req.query.price; // product price
        var prdctCnt = req.query.prdct_cnt; // product count
        
		// Shopping Buy Sum
		var sumQuery = 'select * from TB_SHOPPING_BUY_LIST as TSBL where TSBL.DEL_YN = "N" AND TSBL.USER_WECHAT_ID = ?';
        connection.query(sumQuery, wechatId, function (err, row) {
            if (err) {

                console.error("err : " + err);
                throw err;
            }else{
                var buyPrdctCnt = row.length;
                var buyPrdctSumPrice = 0;
                for(var i=0; i<buyPrdctCnt; i++) {
                    buyPrdctSumPrice += (row[i].SHOPPING_CNT * row[i].PRICE);
                }
                console.log("### Shopping Buy Sum ###");
                //console.log("### Data Success ### " + JSON.stringify(buyPrdctSumPrice));
                res.send({buyCnt: buyPrdctCnt, buySumPrice: buyPrdctSumPrice});
            }
            connection.release();
        });
    });
});

module.exports = router;
