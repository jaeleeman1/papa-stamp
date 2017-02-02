/**
 * Created by SDS on 2017-02-02.
 */

var config = require('../lib/config');
var WechatAPI = require('wechat-api');

// config.appID = 'wx9aa7c34851e950de';
// config.appsecret = '84f007b293a60d3d90919308ac29a033';


// var api = new WechatAPI(config.appID, config.appsecret);
var api = new WechatAPI('wx9aa7c34851e950de', '84f007b293a60d3d90919308ac29a033');

module.exports = wechatApi;
