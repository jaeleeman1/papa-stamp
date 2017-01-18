var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//GET Shopping List
router.get('/', function (req, res, next) {
    getConnection(function (err, connection){
        var query = 'select * from TB_SHOPPING_LIST';

        connection.query(query, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("shoppingList success : " + JSON.stringify(row));
                res.render('shopping/shoppingList', {data:row});
            }
            connection.release();
        })
    });
});

//GET Shopping Detail
router.get('/shoppingDetail', function (req, res, next) {
    getConnection(function (err, connection){
        var query = 'select * from TB_SHOPPING_LIST as TSL where TSL.PRDCT_ID = ?';
        var id = req.query.id; // product Id

        connection.query(query, id, function (err, row) {
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
        var query = 'select * from TB_SHOPPING_LIST as TSL, TB_SHOPPING_BUY_LIST as TSBL where TSL.PRDCT_ID = TSBL.PRDCT_ID and USER_WECHAT_ID = ?';
        //var id = req.query.id; // product Id
        var wechatId = req.query.wechatId; // wechat Id
        var cnt = req.query.cnt; // product count
        console.log('XXXXXXXXXXXXXXXXXXX'+cnt);

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
        //var id = req.query.id; // product Id
        var buyPrdctId = req.body.buy_prdct_id; // wechat Id
        var buyCnt = req.body.buy_count; // product count
        var query = 'update TB_SHOPPING_BUY_LIST set SHOPPING_CNT ='+ buyCnt +' where PRDCT_ID = ?';
        console.log('YYYYYYYYYYYYYYYYYYY   : '+buyPrdctId);
        console.log('XXXXXXXXXXXXXXXXXXX   : '+buyCnt);

        connection.query(query, buyPrdctId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("shoppingBuyList success : " + JSON.stringify(row));
                res.redirect('/shopping/shoppingBuyList?wechatId='+wechatId);
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

    res.render('shopping/shoppingSetting', {wechatId: wechatId, prdctId: prdctId, prdctCnt: prdctCnt});
});

module.exports = router;
