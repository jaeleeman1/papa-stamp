var ejs = require("ejs");
var xml2js = require("xml2js");

var message = {};


/**
 * 接受消息
 * @param req
 * @param callback
 */
message.receive = function (req, callback) {
    req.rawBody = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        req.rawBody += chunk;
    });
    var options = {
        object: true,
        reversible: false,
        coerce: true,
        sanitize: true,
        trim: true,
        arrayNotation: false
    };

    req.on('end', function () {
	xml2js.parseString(req.rawBody, function(err, json) {
		if(err) {
			err.status = 400;
		} else {
			req.body = json;
		}
	});
        //json = xml2json.toJson(req.rawBody, options);
        json = req.body.xml;
	return callback(json);
    });
};

// 回复文本消息模板
var textTemplate = "<xml>" +
    "<ToUserName><![CDATA[<%- ToUserName %>]]></ToUserName>" +
    "<FromUserName><![CDATA[<%- FromUserName%>]]></FromUserName>" +
    "<CreateTime><%= CreateTime%></CreateTime>" +
    "<MsgType><![CDATA[text]]></MsgType>" +
    "<Content><![CDATA[<%- Content%>]]></Content>" +
    "</xml> ";

// 回复图片消息模板
var imageTemplate= "<xml>"+
    "<ToUserName><![CDATA[<%- ToUserName %>]]></ToUserName>"+
    "<FromUserName><![CDATA[<%- FromUserName%>]]></FromUserName>"+
    "<CreateTime><%= CreateTime%></CreateTime>"+
    "<MsgType><![CDATA[image]]></MsgType>"+
    "<Image>"+
    "<MediaId><![CDATA[<%- MediaId %>]]></MediaId>"+
    "</Image>"+
    "</xml>";

// 语音消息模板
var voiceTemplate = "<xml>" +
    "<ToUserName><![CDATA[toUser]]></ToUserName>" +
    "<FromUserName><![CDATA[fromUser]]></FromUserName>" +
    "<CreateTime>1357290913</CreateTime>" +
    "<MsgType><![CDATA[voice]]></MsgType>" +
    "<MediaId><![CDATA[media_id]]></MediaId>" +
    "<Format><![CDATA[Format]]></Format>" +
    "<MsgId>1234567890123456</MsgId>" +
    "</xml>";

// 链接消息模板
var linkTemplate = "<xml>" +
    "<ToUserName><![CDATA[toUser]]></ToUserName>" +
    "<FromUserName><![CDATA[fromUser]]></FromUserName>" +
    "<CreateTime>1351776360</CreateTime>" +
    "<MsgType><![CDATA[link]]></MsgType>" +
    "<Title><![CDATA[公众平台官网链接]]></Title>" +
    "<Description><![CDATA[公众平台官网链接]]></Description>" +
    "<Url><![CDATA[url]]></Url>" +
    "<MsgId>1234567890123456</MsgId>" +
    "</xml> ";

// 编译后的模板
var textCompileTemplate = ejs.compile(textTemplate);
var imageCompileTemplate = ejs.compile(imageTemplate);
var voiceCompileTemplate = ejs.compile(voiceTemplate);
var linkCompileTemplate = ejs.compile(linkTemplate);

/**
 * 消息回复
 * @type {{}}
 */
message.replay = {};

/**
 * 回复文本消息
 * @param obj
 * obj
 * {}
 */
message.replay.text = function (obj, text) {
    var model = {
        ToUserName: obj.FromUserName,
        FromUserName: obj.ToUserName,
        CreateTime: new Date().getTime(),
        Content: text
    };

    return textCompileTemplate(model);
};

/**
 * 回复图片消息
 * @param obj 接收的消息对象
 * @param mediaId 媒体文件id
 */
message.replay.image=function(obj,mediaId)
{
    var model = {
        ToUserName: obj.FromUserName,
        FromUserName: obj.ToUserName,
        CreateTime: new Date().getTime(),
	MediaId: mediaId
    };
    
    return imageCompileTemplate(model);
};


module.exports = message;
