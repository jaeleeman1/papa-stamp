var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//Post , Taxi target address  Information
router.get('/', function (req, res, next) {
    getConnection(function (err, connection) {
        var wechatId = 'jaeleeman1'//req.query.wechat_id;
        var query = 'SELECT TRANSLATION_ADDR_CN FROM TB_ROAD_INFO WHERE  USER_OPEN_ID = ?  ORDER BY ROAD_SEQ DESC LIMIT 1';

        connection.query(query, wechatId, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                console.log("rows : " + JSON.stringify(rows));
                res.render('taxiAddress', { rows : rows });
            }
            connection.release();
        })
    })
});

module.exports = router;
