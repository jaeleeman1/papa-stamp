var enviromentConfig = require('config');
var config = {};

//Database
config.host = enviromentConfig.get('local.host');
// config.host = 'ipark.cd2ja5ctb3jo.ap-northeast-1.rds.amazonaws.com';
config.port = 43306;
config.username = 'ipark';
config.password = 'lee2336^^';
config.database = 'BEST_FOOD';

//Domain
config.url = enviromentConfig.get('local.url');
// config.url = 'https://whereareevent.com';

//Logging
config.loglevel = 'debug';

module.exports = config;
