var express = require('express'),
	weixin = require('weixin-api'),
	bodyParser = require('body-parser'),
	router = express.Router();

var WechatAPI = require('wechat-api');
var api = new WechatAPI('wx9aa7c34851e950de', '84f007b293a60d3d90919308ac29a033');


// 解析器
//router.use(express.bodyParser());
//app.use(xmlBodyParser);



// 接入验证
router.get('/', function(req, res) {		
	if (weixin.checkSignature(req)) {
        console.log("checkSignature return true");
		//res.send(200, req.query.echostr);
		res.status(200).send(req.query.echostr);
	} else {
        console.log("checkSignature return false");
		//res.send(200, 'fail');
		res.status(200).send("fail");
	}
});

// config
weixin.token = 'nbnl2016';

// 监听文本消息
weixin.textMsg(function(msg) {
	console.log("textMsg received");
	console.log(JSON.stringify(msg));

	var resMsg = {};

	switch (msg.content) {
		case "text" :
			// 返回文本消息
			resMsg = {
				fromUserName : msg.toUserName,
				toUserName : msg.fromUserName,
				msgType : "text",
				content : "text message content",
				funcFlag : 0
			};
			break;
	
		case "music" :
			// 返回音乐消息
			resMsg = {
				fromUserName : msg.toUserName,
				toUserName : msg.fromUserName,
				msgType : "music",
				title : "music title",
				description : "music description",
				musicUrl : "musicUrl",
				HQMusicUrl : "HQMusicUrl",
				funcFlag : 0
			};
			break;
		
		case "news" :
		
			var articles = [];
			articles[0] = {
				title : "articles[0] title",
				description : "articles[0] description",
				picUrl : "http://weizhifeng.net/images/tech/composer.png",
				url : "http://weizhifeng.net/manage-php-dependency-with-composer.html"
			};

			articles[1] = {
				title : "articles[1] title",
				description : "articles[1] description",
				picUrl : "http://weizhifeng.net/images/poem/bayuexihu.jpg",
				url : "http://weizhifeng.net/bayuexihu.html"
			};

			articles[2] = {
				title : "「articles[2] title",
				description : "「articles[2] description",
				picUrl : "http://weizhifeng.net/images/tech/redis.png",
				url : "http://weizhifeng.net/redis-protocol.html"
			};
	
			// 返回图文消息
			resMsg = {
				fromUserName : msg.toUserName,
				toUserName : msg.fromUserName,
				msgType : "news",
				articles : articles,				
				funcFlag : 0
			};
			break;
		default :
			resMsg = {
				fromUserName : msg.toUserName,
				toUserName : msg.fromUserName,
				msgType : "text",
				content : "",
				funcFlag : 0
			};
			break;
	}

	weixin.sendMsg(resMsg);
	console.log(api.getAccessToken(function(err) {
		console.log("WeChatAPI getAccessToken done");
		console.log("WeChatAPI Error : "+err);
	}));
	api.sendText(msg.fromUserName, "WeChatAPI Sample", function(err, data, res) {
		console.log("WeChatAPI sendText done");
		console.log("WeChatAPI Error : "+err);
	});
});

// 监听图片消息
weixin.imageMsg(function(msg) {
	console.log("imageMsg received");
	console.log(JSON.stringify(msg));
});

// 监听位置消息
weixin.locationMsg(function(msg) {
	console.log("locationMsg received");
	console.log(JSON.stringify(msg));
});

// 监听链接消息
weixin.urlMsg(function(msg) {
	console.log("urlMsg received");
	console.log(JSON.stringify(msg));
});

// 监听事件消息
weixin.eventMsg(function(msg) {
	console.log("eventMsg received");
	console.log(JSON.stringify(msg));

	switch (msg.event) {
		case "kf_create_session" :
			break;
		case "kf_close_session" :
			break;
		case "kf_switch_session" :
			break;
		case "subscribe" :
			// create menu
			var menu =  {
				"button": [
					{
						"type": "click", 
						"name": "Menu0", 
						"key": "V1001_TODAY_MUSIC"
					}, 
					{
						"name": "Menu1", 
						"sub_button": [
							{
								"type": "view", 
								"name": "SubMenu0", 
								"url": "http://www.soso.com/"
							}, 
							{
								"type": "view", 
								"name": "SubMenu1", 
								"url": "http://v.qq.com/"
							}, 
							{
								"type": "click", 
								"name": "SubMenu2", 
								"key": "V1001_GOOD"
							}
						]
					}
				]
			};

			api.createMenu(menu, function(err){
				console.log("WeChatAPI createMenu done");
				console.log("WeChatAPI Error : "+err);
			});

			// check user's session status
			api.getClientSessionState(msg.fromUserName, function(err, result) {
				console.log("WeChatAPI getClientSessionState done");
				console.log("WeChatAPI getClientSessionState "+err);
				console.log("WeChatAPI getClientSessionState "+result);
				if(result){
					api.getOnlineCustomServiceList(function(err, result) {
						console.log("WeChatAPI getOnlineCustomServiceList done");
						console.log("WeChatAPI getOnlineCustomServiceList "+err);
						console.log("WeChatAPI getOnlineCustomServiceList "+result);						
						if(err) {
							console.log("WeChatAPI Error : "+err);
						} else {
							// search customer which have minimum sessions
							var minAcceptedCnt = -1;
							var minAcceptedCustomer = "";
							for(var i = 0; i < result.kf_online_list.length; i++) {
								console.log("WeChatAPI OnlineCustomer["+i+"] "+result.kf_online_list[i].kf_account+" accepted_case("+result.kf_online_list[i].accepted_case+")");
								if(result.kf_online_list[i].accepted_case > minAcceptedCnt) {
									minAcceptedCnt = result.kf_online_list[i].accepted_case;
									minAcceptedCustomer = result.kf_online_list[i].kf_account;
								}
							}
							// create session
							if(result.kf_online_list.length > 0 && minAcceptedCnt >= 0) {
								console.log("WeChatAPI target customer account("+minAcceptedCustomer+")");
								api.createSession(minAcceptedCustomer, msg.fromUserName, function(err) {
									console.log("WeChatAPI createSession : "+err);
								})
							}
						}
					});
				}
			});
			
			break;
		case "unsubscribe" :
			break;
		case "CLICK" :
			break;
		case "VIEW" :
			break;
		case "scancode_push" :
			break;
		case "scancode_waitmsg" :
			break;
		case "pic_sysphoto" :
			break;
		case "pic_photo_or_album" :
			break;
		case "pic_weixin" :
			break;
		case "location_select" :
			break;
	}	
});

// Start
router.post('/', function(req, res) {
	console.log("POST start");
	// loop
	weixin.loop(req, res);
	console.log("POST end");
});

module.exports = router;
