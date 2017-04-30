/**
 * Created by yunchae.na on 2017-01-09.
 */

var mysql = require('mysql');
var config = require('../lib/config');

var pool = mysql.createPool( {
    connectionLimit: 50,
    host : config.host ,
    // host : 'http://127.0.0.1:8080',
    port : config.port,
    user : config.username,
    password : config.password,
    database : config.database
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
