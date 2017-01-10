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
router.get('/DetailInfo', function (req, res, next) {

    //console.log(req);

    getConnection(function (err, connection) {

        var query = 'SELECT * FROM FOOD_LIST_CN WHERE ID = ?';
        var id = req.query.id; // foodList Id

        connection.query(query, id, function (err, rows) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("rows : " + JSON.stringify(rows));
                res.render('shoppingDetail', {rows : rows});
            }
            connection.release();
        })
    })
});

module.exports = router;
