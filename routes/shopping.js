var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var config = require('../lib/config');

//GET Shopping List
router.get('/', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = 'jaeleeman1'//req.query.wechat_id; // wechat Id
        var openId = '';
        var buyData = '';

	// Select Shopping Buy List
        var buyQuery = 'select * from TB_SHOPPING_LIST as TSL, TB_SHOPPING_BUY_LIST as TSBL where TSBL.DEL_YN = "N" AND TSL.PRDCT_ID = TSBL.PRDCT_ID and TSBL.USER_WECHAT_ID = ?';
        connection.query(buyQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                buyData = row;
                console.log("### Shopping Buy List ###");
		console.log("### Data Success ### " + JSON.stringify(buyData));
            }
        })
		
		// Select Open ID
        var selectQuery = 'select TUI.USER_OPEN_ID from TB_USER_INFO as TUI where TUI.USER_WECHAT_ID = ?';
        connection.query(selectQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                openId = row[0].USER_OPEN_ID;
                console.log("### Open ID ###");
				console.log("### Data Success ### " + JSON.stringify(openId));
            }
        })

		// Select Shopping List
        var shoppingQuery = 'select TSL.* from TB_SHOPPING_LIST AS TSL';
        connection.query(shoppingQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
		console.log("### Shopping List ###");
		console.log("### Data Success ### " + JSON.stringify(row));
                res.render('shopping/shoppingList', {data:row, url:config.url, wechatId:wechatId, buyData:buyData, openId:openId});
            }
            connection.release();
        })
    });
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
		console.log("### Data Success ### " + JSON.stringify(row));
                res.render('shopping/shoppingDetail', {data:row[0], wechatId:wechatId});
            }
            connection.release();
        })
    });
});

//GET Shopping Buy List
router.get('/shoppingBuyList', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.query.wechat_id; // wechat Id
        var prdctId = req.query.prdct_id; // product Id
        var price = req.query.price; // product price
        var prdctCnt = req.query.prdct_cnt; // product count
	var img = req.body.img;    
        var openId = '';

        if(prdctId != '' || prdctId != null) {
            if(prdctCnt == '' || prdctCnt == null || prdctCnt == undefined) {
                prdctCnt = 1;
            }
			
			// Insert Buy List
            var insertQuery = 'insert into TB_SHOPPING_BUY_LIST (USER_WECHAT_ID, PRDCT_ID, PRICE, IMG_URL, SHOPPING_CNT) values (' + '"'+ wechatId + '"' +  ', ?' + ', ' + price + ', ' + img + ', ' + prdctCnt + ') on DUPLICATE KEY update SHOPPING_CNT = '+ prdctCnt;
            connection.query(insertQuery, prdctId, function (err, row) {
                if (err) {
                    console.error("err : " + err);
                    throw err;
                }else{
		    console.log("### Insert Buy List ###");
		    console.log("### Data Success ### " + JSON.stringify(row));
                }
            })
        }
		
        // Select Open ID
        var openIdQuery = 'select USER_OPEN_ID from TB_USER_INFO as TUI where USER_WECHAT_ID = ?';
        connection.query(openIdQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                openId = row[0].USER_OPEN_ID;
		console.log("### Select Open ID ###");
		console.log("### Data Success ### " + JSON.stringify(openId));
            }
        })

        var buyQuery = 'select * from TB_SHOPPING_LIST as TSL, TB_SHOPPING_BUY_LIST as TSBL where TSBL.DEL_YN = "N" and TSL.PRDCT_ID = TSBL.PRDCT_ID and USER_WECHAT_ID = ?';
        // Select Buy List
        connection.query(buyQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
		console.log("### Shopping Buy List ###");
		console.log("### Data Success ### " + JSON.stringify(row));
                res.render('shopping/shoppingBuyList', {data:row, wechatId:wechatId, url:config.url, openId:openId});
            }
            connection.release();
        })
    });
});

///POST Shopping Buy List
router.post('/shoppingBuyList', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.body.wechat_id; // wechat Id
        var prdctId = req.body.prdct_id; // wechat Id
        var prdctCnt = req.body.prdct_cnt; // product count
        var price = req.body.price; // price
	    
	// Update Buy List
        var updateQuery = 'update TB_SHOPPING_BUY_LIST SET SHOPPING_CNT ='+ prdctCnt +' where USER_WECHAT_ID="jaeleeman1" and PRDCT_ID = ?';
        connection.query(updateQuery, prdctId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
		console.log("### Update Shopping Buy List ###");
                res.redirect('/shopping/shoppingBuyList?wechat_id='+ wechatId +'&prdct_id='+ prdctId +'&prdct_cnt=' + prdctCnt +'&price=' + price);
            }
            connection.release();
        })
    });
});

//GET Shopping Setting
router.get('/shoppingSetting', function (req, res, next) {
    var wechatId = req.query.wechat_id; // product Id
    var prdctId = req.query.prdct_id; // product Id
    var prdctCnt = req.query.prdct_cnt; // product count
    var price = req.query.price; // product price

    if(prdctCnt == '') {
        prdctCnt = 1;
    }
    console.log("### Shopping Setting ###");
    res.render('shopping/shoppingSetting', {wechatId: wechatId, prdctId: prdctId, prdctCnt: prdctCnt, price: price});
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
                res.send({wechatId: wechatId});
            }
            connection.release();
        })
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
		console.log("### Data Success ### " + JSON.stringify(buyPrdctSumPrice));
                res.send({buyCnt: buyPrdctCnt, buySumPrice: buyPrdctSumPrice});
            }
            connection.release();
        })
    });
});

module.exports = router;
