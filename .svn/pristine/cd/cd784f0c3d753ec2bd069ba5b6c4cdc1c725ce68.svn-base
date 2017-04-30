var ejs = require("ejs");
var xml2js = require("xml2js");

var message = {};

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


var ACCESS_TOKEN = new Object();

message.shoppingResSend =  function(req, res) {
    console.log('start post : shopping result send  ');

    var ProductSet  =  JSON.parse(JSON.stringify(req.body));

    console.log('ProductSet User_Open_Id : ' + ProductSet.User_Open_Id);
    console.log('ProductName : ' + ProductSet.Prdct[0].Prdct_Nm);
    console.log('Product length : ' + ProductSet.Prdct.length);

    if(ProductSet == '{}') {
        console.log('error : 400');
        return false;
    }

    var total_amount    = 0;
    var shoppingResult  = ProductSet.Prdct.length +'개 물품 주문 접수 되었습니다. \n';

    shoppingResult  += '--------------------------------------- \n';
    for(var i = 0; i <  ProductSet.Prdct.length; i++)
    {

        shoppingResult += 	ProductSet.Prdct[i].Prdct_Nm + "\n " +
            ": 수량"+ProductSet.Prdct[i].Prdct_Cnt+ "개 |" +
            "￥ " + ProductSet.Prdct[i].Price * ProductSet.Prdct[i].Prdct_Cnt + "\n "

        total_amount += ProductSet.Prdct[i].Price * ProductSet.Prdct[i].Prdct_Cnt;
    }

    shoppingResult += "\n 합계 ￥" + total_amount ;
    shoppingResult += '\n --------------------------------------- \n';

    console.log( shoppingResult);

    function getToken() {
        console.log(' get token start ');

        //official (3��)
        var appID = 'wx9242b0f3c507cb24';
        var appsecret = '3f901f86a389445276b13e1b661935d6';


        var accessTokenURL = "https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid="+appID+"&secret="+appsecret;
        var accessTokenOptions = {
            method: "GET",
            url: accessTokenURL,
        };
        console.log(' get token start2 ');
        function accessTokenCallback (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                ACCESS_TOKEN.access_token = data.access_token;
                ACCESS_TOKEN.expiration = (new Date().getTime()) + (data.expires_in - 10) * 1000;

                // console.log("New access token retrieved: " + ACCESS_TOKEN.access_token);

                console.log(' get token start3 ');
                //token 받고 조립한 결과 전송
                pushChat(   ProductSet.User_Open_Id,shoppingResult  );

            }else{
                console.log(' get token start 5');
            }
        }
        console.log(' get token start 4');
        request(accessTokenOptions, accessTokenCallback);
    };

    getToken( );

    console.log(' get token end ');
    return true;
} ;

function pushChat(openId, Result) {
    console.log(' pushChat start ');

    var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+ACCESS_TOKEN.access_token;

    var pushChatOptions = {
        method: "POST",
        url: pushChatURL,
        body: JSON.stringify({
            "touser" : openId,
            "msgtype":"text",
            "text":
                {
                    "content":Result
                }
        })
    };

    function pushChatCallback (error, response, body) {
        // console.log("log : " + body);
        if (!error && response.statusCode == 200) {
            bodyObject = JSON.parse(body);
            if (bodyObject.errmsg === "ok") {
                console.log("Message successfully delivered--"  );
                // res.status(200).send('Send Sucess');

            } else {// this doesn't work until restarting server ***
                console.log( " There was an error delivering the message: " + Result
                    + "  statusCode: "+response.statusCode + " error :" + error);
            }
        }
    }

    request(pushChatOptions, pushChatCallback);
}

module.exports = message;
