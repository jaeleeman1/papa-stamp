var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//Post , Taxi target address  Information
router.get('/', function (req, res, next) {
    var DATA  =  JSON.parse(JSON.stringify(req.body));
    console.log('##### TAXI ADDRESS START  #####',DATA.useropenid );

    getConnection(function (err, connection) {

        var query = 'SELECT * FROM TB_ROAD_INFO WHERE  USER_OPEN_ID = ?  ORDER BY ROAD_SEQ DESC LIMIT 1';
        var id    =  DATA.useropenid;  // user open Id
        var id    ='KMJ';

        connection.query(query, id, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                console.log("rows : " + JSON.stringify(rows));
                res.render('taxiAddressLandscape', { rows : rows });
            }
            connection.release();
        })
    })
});

//Post , Taxi target address  Information
router.post('/', function (req, res, next) {


    var DATA  =  JSON.parse(JSON.stringify(req.body));
    console.log('##### TAXI ADDRESS START  #####',DATA.useropenid );

    getConnection(function (err, connection) {

        var query = 'SELECT * FROM TB_ROAD_INFO WHERE  USER_OPEN_ID = ?  ORDER BY ROAD_SEQ DESC LIMIT 1';
        var id    =  DATA.useropenid;  // user open Id
        // var id ='KMJ';

        connection.query(query, id, function (err, rows) {
            if (err) {
              //  console.error("err : " + err);
                throw err;
            }else{
                console.log("rows : " + JSON.stringify(rows));
                res.render('taxiAddressLandscape', { rows : rows });
            }
            connection.release();
        })
    })


    // res.render('taxiAddressLandscape', { rows : "중국도로찾기" });
});

module.exports = router;
