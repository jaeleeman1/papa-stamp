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
		case "menu" : 
			var menu =  {
				"button":[
					{	
						"type":"click",
						"name":"Daily Song",
						"key":"V1001_TODAY_MUSIC"
					},
					{
						"type":"click",
						"name":" Artist Profile",
						"key":"V1001_TODAY_SINGER"
					},
					{
						"name":"Menu",
						"sub_button":[
						{	
							"type":"view",
							"name":"Search",
							"url":"http://www.soso.com/"
							},
							{
							"type":"view",
							"name":"Video",
							"url":"http://v.qq.com/"
							},
							{
							"type":"click",
							"name":"Like us",
							"key":"V1001_GOOD"
							}]
					}]
				};
				api.createCustomMenu(menu, function(err){
					console.log("WeChatAPI createCustomMenu failed");
					console.log(err);
				});
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
	console.log("WeChatAPI call start");
	console.log(api.getAccessToken(function(err) {
		console.log("WeChatAPI getAccessToken failed");
		console.log(err);
	}));
	api.sendText(msg.fromUserName, "WeChatAPI Sample", function(err, data, res) {
		console.log("WeChatAPI call failed");
		console.log(err);
	});
	console.log("WeChatAPI call end");
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
	
});

// Start
router.post('/', function(req, res) {
	console.log("POST start");
	// loop
	weixin.loop(req, res);
	console.log("POST end");
});

module.exports = router;
