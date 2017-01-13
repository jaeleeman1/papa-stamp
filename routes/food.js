/**
 * Created by yunchae.na on 2017-01-09.
 */
var express = require('express');
var router = express.Router();
var getConnection = require('./db');
// var baiduMap = require('baidumap');

//GET foodShop List
router.get('/shopList', function (req, res, next) {

    getConnection(function (err, connection){
        var query = 'select * from TB_FOOD_SHOP_LIST_CN';

        connection.query(query, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                   console.log("rows : " + JSON.stringify(rows));
                   res.render('foodShopList', {rows : rows, length:rows.length});
            }
            connection.release();
        })
    });
});


//GET foodShop detail Information
router.get('/shopInfo', function (req, res, next) {
    getConnection(function (err, connection) {
        var query = 'select * from TB_FOOD_SHOP_LIST_CN A, TB_FOOD_MENU B where A.FOOD_ID = B.FOOD_ID and A.FOOD_ID = ?';
        var id = req.query.id; // foodList Id

        connection.query(query, id, function (err, rows) {
            if (err) {
              //  console.error("err : " + err);
                throw err;
            }else{
             //   console.log("rows : " + JSON.stringify(rows));
                res.render('foodShopInfo', {rows : rows, length:rows.length});
            }
            connection.release();
        })
    })
});

module.exports = router;
