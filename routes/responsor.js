var express = require('express'),
	weixin = require('weixin-api'),
	bodyParser = require('body-parser'),
	router = express.Router();

// 解析器
//router.use(express.bodyParser());
//app.use(xmlBodyParser);

// 接入验证
router.get('/', function(req, res) {		
	// 签名成功
	if (weixin.checkSignature(req)) {
        console.log("checkSignature return true");
		res.send(200, req.query.echostr);
	} else {
        console.log("checkSignature return false");
		res.send(200, 'fail');
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
	}

	weixin.sendMsg(resMsg);
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
	
	// loop
	weixin.loop(req, res);

});

router.listen(3000);

module.exports = router;
