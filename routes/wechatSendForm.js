var express = require('express'),
    router = express.Router(),
    weixin = require ( 'weixin-api' ),
    api = require("../lib/api"),
    bodyParser = require('body-parser'),
    request = require('request');

var ACCESS_TOKEN = new Object();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('start');
  res.render('wechat/sendForm', {wechatSendTitle: 'Wechat Message Send'});
});

router.get('/msgSend', function(req, res, next) {
  //res.redirect('/wechat');
  res.render('wechat/sendForm', {wechatSendTitle: 'Wechat Message Send'});
});
 
router.post('/msgSend', function(req, res, next) {
  console.log('start message send');
  console.log(req.body);
  var openId = req.body.wechatId;

  getToken(openId);
  res.redirect('/wechat');
});

function getToken(openId) {
	console.log(' get token start ');

    //var openId = 'oH7FywN073pRVpCF0G6nMl6iI8mg';
	var appID = 'wx87ac1cef286fb38d';
	var appsecret = '39278936f9e35c2e82ed57f25a05717f';

	var accessTokenURL = "https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid="+appID+"&secret="+appsecret;
	var accessTokenOptions = {
		method: "GET",
		url: accessTokenURL,
	};

	function accessTokenCallback (error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			ACCESS_TOKEN.access_token = data.access_token;
			ACCESS_TOKEN.expiration = (new Date().getTime()) + (data.expires_in - 10) * 1000;

			pushChat(openId);
		}
	}
	request(accessTokenOptions, accessTokenCallback);
};

function pushChat(wechatId) {
	console.log(' pushChat start ');

	var formatted_message = " Couphone Push Message "   ;
	var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+ACCESS_TOKEN.access_token;

	var pushChatOptions = {
		method: "POST",
		url: pushChatURL,
		body: JSON.stringify({
			"touser" : wechatId,
			"msgtype" : "news",
			"news" : {
				"articles": [
					{
				"title": "Happy Day",
				"description": "Is Really A Happy Day",
				"url": "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_buy_01.png",
				"picurl": "http://cfile4.uf.tistory.com/image/25158B3D52B8BC572EFCB0"
					}
				]
			}
		})
	};

	function pushChatCallback (error, response, body) {
		console.log("log : " + body);
		if (!error && response.statusCode == 200) {
			bodyObject = JSON.parse(body);
			if (bodyObject.errmsg === "ok") {
				console.log("Message successfully delivered--" + formatted_message);
			} else {
				console.log( " There was an error delivering the message: " + formatted_message
						 + "  statusCode: "+response.statusCode + " error :" + error);
			}
		}
	}
	request(pushChatOptions, pushChatCallback);
}

module.exports = router;
