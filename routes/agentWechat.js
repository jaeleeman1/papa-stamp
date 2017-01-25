var express = require('express'),
    router = express.Router(),
    weixin = require ( 'weixin-api' ),
    api = require("../lib/api"),
    bodyParser = require('body-parser'),
    request = require('request'),
    getConnection = require('../lib/db_connection');

var ACCESS_TOKEN = new Object();
var RETURN_DATA = new Object();

/* GET Agent Wechat Init Page. */
router.get('/', function(req, res, next) {
	console.log('##### Ger Agent Wechat Start #####');
    	res.render('wechat/agentWechatForm', {wechatSendTitle: 'Wechat Message Tool'});
});

router.get('/agentWechat', function(req, res, next) {
    	console.log('##### Get Agent Wechat Start #####');
    	res.render('wechat/agentWechatForm', {wechatSendTitle: 'Wechat Message Tool'});
});

router.post('/agentWechat', function(req, res, next) {
    	console.log('##### Post Agent Wechat Start #####');

	getUserInfo(req.body.wechatId);

	getRoadInfo(req.body.wechatId);

	api.database.getUserInfo(req, function(obj) {
		var data = JSON.parse(obj);
		console.log(''+ data.USER_OPEN_ID);
	});

	getToken(RETURN_DATA.openId);

	res.redirect('/wechat');
});

router.post('/shoppingResultSend', function(req, res, next) {
    console.log('##### Post  shoppingResSend Start #####');
    api.sender.shoppingResSend( req , res, next)
    {
        console.log(   res.statusCode );
        if (  res.statusCode != 200) {
            console.log('##### SEND ERROR  #####');
        }

        res.status(200).send('Send Sucess');
    }
});

router.post('/taxiDepartSend', function(req, res, next) {
    console.log('##### Post  taxi Start #####');
    console.log('req ::::::: ', req.body);

    api.sender.resSend( req , res, next)
    {
        console.log(   res.statusCode );
        if (  res.statusCode != 200) {
            console.log('##### SEND ERROR  #####');
        }

        res.status(200).send('Send Sucess');
    }
});


router.post('/foodResultSend', function(req, res, next) {
    console.log('##### Post  foodResSend Start #####');
    api.foodResultSender.foodResSend( req , res, next)
    {
        console.log(   res.statusCode );
        if (  res.statusCode != 200) {
            console.log('##### SEND ERROR  #####');
        }
        res.status(200).send('Send Sucess');
    }
});
function getRoadInfo(wechatId) {
    	console.log('##### get Road info #####');

	var returnData;
	var getUserInfoURL = "http://nbnl.couphone.cn:8080/api/getRoadInfo?wechatId=" + wechatId;
	var getUserInfoOptions = {
		method: "GET",
		url: getUserInfoURL,
	};

	function getUserInfoCallback (error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			console.log('*****'+ data.USER_OPEN_ID + '*****');
			RETURN_DATA.openId = data.USER_OPEN_ID;
		}
	}
	request(getUserInfoOptions, getUserInfoCallback);
}

function getUserInfo(wechatId) {
    	console.log('##### get user info #####');

	var returnData;
	var getUserInfoURL = "http://nbnl.couphone.cn:8080/api/getUserInfo?wechatId=" + wechatId;
	var getUserInfoOptions = {
		method: "GET",
		url: getUserInfoURL,
	};

	function getUserInfoCallback (error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			console.log('*****'+ data.USER_OPEN_ID + '*****');
			RETURN_DATA.openId = data.USER_OPEN_ID;
		}
	}
	request(getUserInfoOptions, getUserInfoCallback);
}

function getToken(openId) {
    	console.log('##### get token #####');

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
	console.log('##### pushChat start #####');

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
