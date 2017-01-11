/**
 * Created by SDS on 2017-01-09.
 */

var express = require('express');
var router = express.Router();
var getConnection = require('./db');

//var connection = mysql.createConnection({
//    host    :'127.0.0.1',
//    port : 43306,
//    user : 'cphonemaster',
//    password : 'dnausehdcphone',
//    database:'CPHONE'
//});

//GET shopping detail Information
router.get('/shopInfo', function (req, res, next) {

    //console.log(req);

    getConnection(function (err, connection) {

        var query = 'select * from TB_FOOD_SHOP_LIST_CN A, TB_FOOD_MENU B where A.ID = B.ID and A.ID = ?';
        var id = req.query.id; // foodList Id

        connection.query(query, id, function (err, rows) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("rows : " + JSON.stringify(rows));
                res.render('foodShopInfo', {rows : rows, length:rows.length});
            }
            connection.release();
        })
    })
});

module.exports = router;
