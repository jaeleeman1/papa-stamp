var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//GET foodShopMap Basic rendering
router.get('/', function (req, res, next) {
    res.render('shopping/shoppingList');
});

//GET foodShopList
router.get('/shoppingList', function (req, res, next) {
    getConnection(function (err, connection){
        var query = 'select * from TB_SHOPPING_LIST';

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

module.exports = router;
