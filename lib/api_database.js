var getConnection = require('../lib/db_connection');

var database = {};

//Select User Information Table
database.selectUserInfo = function (userOpenId, callback) {
    getConnection(function (err, connection) {

        var query = 'select * from TB_FOOD_USER_INFO A where A.ID = ?';
        var id = userOpenId;

        connection.query(query, id, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                //   console.log("rows : " + JSON.stringify(rows));
                return callback(rows);
            }
            connection.release();
        })
    })
};

module.exports = database;