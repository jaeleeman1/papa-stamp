/**
 * Created by SDS on 2017-01-09.
 */

var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host : '127.0.0.1',
    port : 43306,
    user : 'cphonemaster',
    password : 'dnausehdcphone',
    database : 'CPHONE'
});

var getConnection = function (cb) {
    pool.getConnection(function (err, connection) {
        if(err) {
            return cb(err);
        }
        cb(null, connection);
    });
};
module.exports = getConnection;