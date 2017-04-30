var config = {};

//Database
// config.host = '127.0.0.1';
config.host = 'ipark.cd2ja5ctb3jo.ap-northeast-1.rds.amazonaws.com';
config.port = 43306;
config.username = 'ipark';
config.password = 'lee2336^^';
config.database = 'EVENT';

//Domain
// config.url = 'http://localhost:8080';
config.url = 'https://whereareevent.com';

//Wechat Config
// Development
//config.appID = 'wx87ac1cef286fb38d';
//config.appsecret = '39278936f9e35c2e82ed57f25a05717f';
config.accessTokenURL = 'https://api.wechat.com/cgi-bin/token?grant_type=client_credential';
config.pushChatURL = 'https://api.wechat.com/cgi-bin/message/custom/send?access_token=';

// Admin
config.appID = 'wx9aa7c34851e950de';
config.appsecret = '84f007b293a60d3d90919308ac29a033';


module.exports = config;
