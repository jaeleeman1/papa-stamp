var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//GET User Information
router.get('/getUserInfo', function (req, res, next) {

    getConnection(function (err, connection) {

        var query = 'select * from TB_USER_INFO as TUI TUI.USER_OPEN_ID = ?';
        var id = req.query.userOpenId;

        connection.query(query, id, function (err, rows) {
            if (err) {
            //    console.error("err : " + err);
                  throw err;
            }else{
            //    console.log("rows : " + JSON.stringify(rows));
                  res.render('foodShopInfo', {rows : rows, length:rows.length});
            }
            connection.release();
        })
    })
});

module.exports = router;
