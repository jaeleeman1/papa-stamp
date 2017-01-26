var config = {};

//Database
// config.host = 'localhost';
config.host = 'cphone.cwv6eeev1qqm.ap-northeast-2.rds.amazonaws.com';
config.port = 43306;
config.username = 'cphonemaster';
config.password = 'dnausehdcphone';
config.database = 'CPHONE';

// config.url = 'http://localhost:8080';
config.url = 'http://nbnl.couphone.cn';

//Wechat Config
config.appID = 'wx87ac1cef286fb38d';
config.appsecret = '39278936f9e35c2e82ed57f25a05717f';
config.accessTokenURL = 'https://api.wechat.com/cgi-bin/token?grant_type=client_credential';
config.pushChatURL = 'https://api.wechat.com/cgi-bin/message/custom/send?access_token=';

module.exports = config;
