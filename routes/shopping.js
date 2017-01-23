var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//GET Shopping List
router.get('/', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = 'jaeleeman1'//req.query.wechat_id; // wechat Id
        var query = 'SELECT TSL.* FROM TB_SHOPPING_LIST AS TSL';
        //var data = {};
        connection.query(query, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("shoppingList success : " + JSON.stringify(row));
                //dataa += JSON.stringify(row);
                res.render('shopping/shoppingList', {data: row});
            }
            connection.release();
        })

        //console.log('XXXXXXXXXXXXXXXXXX' + data);
        //res.render('shopping/shoppingList', {data: data});
    });
});

//GET Shopping Detail
router.get('/shoppingDetail', function (req, res, next) {
    getConnection(function (err, connection){
        var wechatId = req.query.wechat_id; // wechat Id
        var prdctId = req.query.prdct_id; // product Id
        var query = 'SELECT * FROM TB_SHOPPING_LIST AS TSL WHERE TSL.PRDCT_ID = ?';

        connection.query(query, prdctId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("shoppingDetail success : " + JSON.stringify(row));
                res.render('shopping/shoppingDetail', {data:row[0]});
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

        if(prdctId != '' || prdctId != null) {
            if(prdctCnt == '' || prdctCnt == null || prdctCnt == undefined) {
                prdctCnt = 1;
            }else if (prdctCnt == 'plus') {
                prdc
            }
            var insertQuery = 'INSERT INTO TB_SHOPPING_BUY_LIST (USER_WECHAT_ID, PRDCT_ID, PRICE, SHOPPING_CNT) VALUES ("jaeleeman1", ?, ' + price + ', ' + prdctCnt + ') ON DUPLICATE KEY UPDATE SHOPPING_CNT = '+ prdctCnt;
            // Insert Buy List
            connection.query(insertQuery, prdctId, function (err, row) {
                if (err) {
                    console.error("err : " + err);
                    throw err;
                }else{
                    console.log("shoppingBuyList success : " + JSON.stringify(row));
                }
            })
        }

        var query = 'select * from TB_SHOPPING_LIST as TSL, TB_SHOPPING_BUY_LIST as TSBL where TSBL.DEL_YN = "N" AND TSL.PRDCT_ID = TSBL.PRDCT_ID and USER_WECHAT_ID = ?';
        // Select Buy List
        connection.query(query, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("shoppingBuyList success : " + JSON.stringify(row));
                res.render('shopping/shoppingBuyList', {data:row});
            }
            connection.release();
        })
    });
});

///POST Shopping Buy List
router.post('/shoppingBuyList', function (req, res, next) {
    //api.database.insertBuyCount(req, function(obj) {
    //var data = JSON.parse(obj);
    //console.log(''+ data.USER_OPEN_ID);
    //});

    getConnection(function (err, connection){
        var wechatId = req.body.wechat_id; // wechat Id
        var prdctId = req.body.prdct_id; // wechat Id
        var prdctCnt = req.body.prdct_cnt; // product count
        var price = req.body.price; // price
        var query = 'UPDATE TB_SHOPPING_BUY_LIST SET SHOPPING_CNT ='+ prdctCnt +' WHERE USER_WECHAT_ID="jaeleeman1" AND PRDCT_ID = ?';

        connection.query(query, prdctId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("shoppingBuyList success : " + JSON.stringify(row));
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

    res.render('shopping/shoppingSetting', {wechatId: wechatId, prdctId: prdctId, prdctCnt: prdctCnt, price: price});
});

//GET Shopping Delete All
router.post('/shoppingDeleteAll', function (req, res, next) {
    getConnection(function (err, connection) {
        var wechatId = req.query.wechat_id; // product Id
        var prdctId = req.query.prdct_id; // product Id
        var prdctCnt = req.query.prdct_cnt; // product count

        //var query = 'UPDATE TB_SHOPPING_BUY_LIST AS TSBL SET TSBL.DEL_YN = "Y" WHERE TSBL.USER_WECHAT_ID = ?';
        var query = 'DELETE FROM TB_SHOPPING_BUY_LIST WHERE USER_WECHAT_ID = ?';

        connection.query(query, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                //console.log("shoppingBuyList success : " + JSON.stringify(row));
                res.redirect('/shopping?wechat_id='+ wechatId);
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
        var query = 'SELECT * FROM TB_SHOPPING_BUY_LIST as TSBL WHERE TSBL.DEL_YN = "N" AND TSBL.USER_WECHAT_ID = ?';

        connection.query(query, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                var buyPrdctCnt = row.length;
                var buyPrdctSumPrice = 0;
                for(var i=0; i<buyPrdctCnt; i++) {
                    buyPrdctSumPrice += (row[i].SHOPPING_CNT * row[i].PRICE);
                }

                res.send({buyCnt: buyPrdctCnt, buySumPrice: buyPrdctSumPrice});
            }
            connection.release();
        })
    });
});

module.exports = router;