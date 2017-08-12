var mysql = require('mysql');
var config = require('../lib/config');

var pool = mysql.createPool( {
    host : config.host,
    port : config.port,
    user : config.username,
    password : config.password,
    database : config.database,
    connectionLimit: 100,
    waitForConnections: false
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
