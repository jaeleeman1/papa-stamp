/**
 * Created by yunchae.na on 2017-01-09.
 */
var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//GET foodShopMap Basic rendering
router.get('/', function (req, res, next) {
      res.render('foodShopList');
});

//GET foodShopList
router.get('/shopList', function (req, res, next) {
    getConnection(function (err, connection){
        var query = 'select * from TB_FOOD_SHOP_LIST';

        connection.query(query, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("foodShopList success : " + JSON.stringify(row));
                res.send({data:row});
            }
            connection.release();
        })
    });
});


//GET foodShop detail Information
router.get('/shopInfo', function (req, res, next) {
    getConnection(function (err, connection) {
        var query = 'select * from TB_FOOD_SHOP_LIST A, TB_FOOD_MENU B where A.FOOD_ID = B.FOOD_ID and A.FOOD_ID = ?';
        var id = req.query.id; // foodList Id

        connection.query(query, id, function (err, rows) {
            if (err) {
              //  console.error("err : " + err);
                throw err;
            }else{
               // console.log("rows : " + JSON.stringify(rows));

                if(rows.length > 0){
                    res.render('foodShopInfo', {rows : rows, length:rows.length});
                }else{
                    res.render('foodShopList');
                }
            }
            connection.release();
        })
    })
});

module.exports = router;
