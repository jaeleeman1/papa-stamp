/**
 * Created by SDS on 2017-02-02.
 */

var config = require('../lib/config');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(config.appID, config.appsecret);

module.exports = wechatApi;
