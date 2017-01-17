var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//GET Shopping rendering
router.get('/', function (req, res, next) {
    getConnection(function (err, connection){
        var query = 'select * from TB_SHOPPING_LIST';

        connection.query(query, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                // console.log("foodShopList success : " + JSON.stringify(row));
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
                // console.log("foodShopList success : " + JSON.stringify(row));
                res.render('shopping/shoppingDetail', {data:row});
            }
            connection.release();
        })
    });
});

module.exports = router;
