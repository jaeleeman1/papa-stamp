var request = require('request');
var config = require('./config');
var sender = {};
var ACCESS_TOKEN = new Object();

// var WechatAPI = require('wechat-api');
var api = require('../lib/wechatApi');
// var api = new WechatAPI(config.appID, config.appsecret);

sender.shoppingInitSend =  function(req, res) {
    console.log('Start shopping Init send  ');
    var wechatId = req.query.nick_name; // wechat Id
    var shoppingInitUrl = 'http://nbnl.couphone.cn/shopping?nick_name=' + wechatId;
    var shoppingTitle = "쇼핑 홈페이지로 이동";
    var articles = [
        {
            title : shoppingTitle,
            // "description": message,
            url : shoppingInitUrl,
            picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face02.png"
        }
    ];

    api.sendNews(openId, articles, function (err) {
        if (err) {
            console.error("err : " + err);
            throw err;
        }else {
            console.log('Complete shopping Init send');
        }
    });
};

sender.shoppingResSend =  function(req, res) {
    console.log('Start shopping result send');

    var ProductSet = req.body;
    // var ProductSet = JSON.stringify(req.body);

    console.log('Product User_Open_Id : ' + ProductSet.User_Open_Id);
    console.log('Product Prdct_Nm : ' + ProductSet.Prdct_Nm);
    console.log('Product Prdct_Cnt : ' + ProductSet.Prdct_Cnt);
    console.log('Product Price : ' + ProductSet.Price);
    console.log('Product Length : ' + ProductSet.Length);
	
    var prdctLength = ProductSet.Length;

    if(JSON.stringify(ProductSet) == '{}') {
        console.log('error : 400');
        return false;
    }
  
    var total_amount    = 0;
    var shoppingResult  = prdctLength +'개 물품 주문 접수 되었습니다. \n';

    shoppingResult  += '-------------------------------- \n';
    if(prdctLength == 1) {
    	shoppingResult += 	ProductSet.Prdct_Nm + "\n " +
	    ": 수량"+ProductSet.Prdct_Cnt + "개 |" +
	    "￥ " + ProductSet.Price * ProductSet.Prdct_Cnt + "\n "

	total_amount += ProductSet.Price * ProductSet.Prdct_Cnt;
    }else {    
	    for(var i = 0; i <  prdctLength; i++)
	    {
		shoppingResult += 	ProductSet.Prdct_Nm[i] + "\n " +
		    ": 수량"+ProductSet.Prdct_Cnt[i] + "개 |" +
		    "￥ " + ProductSet.Price[i] * ProductSet.Prdct_Cnt[i] + "\n "

		total_amount += ProductSet.Price[i] * ProductSet.Prdct_Cnt[i];
	    }
    }

    shoppingResult += "\n 합계 ￥" + total_amount ;
    shoppingResult += '\n -------------------------------- \n';
    
    api.sendText(ProductSet.User_Open_Id, shoppingResult, function(err) {
        if (err) {
            console.error("err : " + err);
            throw err;
        }else {
            console.log("buy shopping message send");
        }
    });
};

// 메세지 전송1 (공통)
sender.msgSend =  function(openId, contents) {

    if(JSON.stringify(contents) == '{}') {
        console.log('error : 400');
        return false;
    }

    sendMessage(openId, contents);

    console.log(' get token end final ');
    return true;
};

// 메세지 전송2 ( get Token )
function sendMessage(openId, contents) {
    console.log(' get token start ');

    //official (3��)
    // var appID = 'wx87ac1cef286fb38d';
    // var appsecret = '39278936f9e35c2e82ed57f25a05717f';
    //official no.2
    var appID = 'wxbe787e4d4b341259';
    var appsecret = 'bba43e076e9657150c0c13729e79d522';

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

            console.log(' get token end');
            console.log('push chat contents :::: ', contents);
            //token 받고 조립한 결과 전송

            pushChat( openId, contents, ACCESS_TOKEN);
        }else{
        }
    }
    request(accessTokenOptions, accessTokenCallback);
};

// 메세지 전송3 ( push 메세지)
function pushChat(openId, contents, token) {
    console.log(' pushChat start ');

    // console.log('msg-openId', openId);
    // console.log('msg-contents', contents);

    var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+token.access_token;

    var pushChatOptions = {
        method: "POST",
        url: pushChatURL,
        body: JSON.stringify(contents)
    };
    //
    // console.log('pushChatOptions :::::::::: ', pushChatOptions);
    // console.log('################################################')

    function pushChatCallback (error, response, body) {
        // console.log("log : " + body);
        if (!error && response.statusCode == 200) {
            bodyObject = JSON.parse(body);
            if (bodyObject.errmsg === "ok") {
                console.log("Message successfully delivered--"  );
                // res.status(200).send('Send Sucess');

            } else {// this doesn't work until restarting server ***
                console.log( " There was an error delivering the message: " + contents
                    + "  statusCode: "+response.statusCode + " error :" + error);
            }
        }
    }

    request(pushChatOptions, pushChatCallback);
}


// sender.foodResSend =  function(req, res) {
//     console.log('start post : food result send  ' + req);
//
//     var FoodSet  =  JSON.parse(JSON.stringify(req.body));
//
//     console.log(' FoodSet : ' + JSON.stringify(req.body));
//
//
//     if(FoodSet == '{}') {
//         console.log('error : 400');
//         return false;
//     }
//     var foodMessage  =    "--------------------------------------- \n";
//     foodMessage     += 	 " 출발 : " + FoodSet.StartPos +  " \n ";
//     foodMessage     +=    "--------------------------------------- \n";
//     foodMessage     +=    " 도착 :" + FoodSet.EndPos +  " \n";
//     foodMessage     +=    FoodSet.Transfortation +    FoodSet.Time + "분 " + FoodSet.Distance  +  " \n ";;
//     foodMessage     +=    "--------------------------------------- \n ";
//
//
//     console.log( foodMessage);
//
//
//     function getToken() {
//         console.log(' get token start ');
//
//         //official (3��)
//         var appID = 'wx9242b0f3c507cb24';
//         var appsecret = '3f901f86a389445276b13e1b661935d6';
//
//
//         var accessTokenURL = "https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid="+appID+"&secret="+appsecret;
//         var accessTokenOptions = {
//             method: "GET",
//             url: accessTokenURL,
//         };
//         console.log(' get token start2 ');
//         function accessTokenCallback (error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 var data = JSON.parse(body);
//                 ACCESS_TOKEN.access_token = data.access_token;
//                 ACCESS_TOKEN.expiration = (new Date().getTime()) + (data.expires_in - 10) * 1000;
//
//                 console.log(' get token start3 ');
//                 //token 받고 조립한 결과 전송
//                 foodPushChat(  FoodSet.UserOpenId,foodMessage,FoodSet.ImageUrl , FoodSet.RestruantName   );
//
//             }else{
//                 console.log(' get token start 5');
//             }
//         }
//         console.log(' get token start 4');
//         request(accessTokenOptions, accessTokenCallback);
//     };
//
//     getToken();
//
//     console.log(' get token end ');
//     return true;
// } ;

// function foodPushChat(openId, message, ImageUrl , Restruant  ) {
//     console.log(' pushChat start ');
//
//     var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+ACCESS_TOKEN.access_token;
//
//     var pushChatOptions = {
//         method: "POST",
//         url: pushChatURL,
//         body: JSON.stringify({
//             "touser" : openId,
//             "msgtype" : "news",
//             "news" : {
//                 "articles": [
//                     {
//                         "title": Restruant,
//                         "description": message,
//                         "url": ImageUrl,
//                         "picurl": "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
//                     },
//                     {
//                         "title": "중국어 도착지",
//                         "url": "http://52.79.56.181:8000/taxiaddress?useropenid="+openId,  //중국어 보여주는 url + OPENID
//                         "picurl": "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
//                     }
//
//                 ]
//             }
//         })
//     };
//
//     function pushChatCallback (error, response, body) {
//
//         if (!error && response.statusCode == 200) {
//             bodyObject = JSON.parse(body);
//             if (bodyObject.errmsg === "ok") {
//                 console.log("Message successfully delivered--"  );
//                 // res.status(200).send('Send Sucess');
//
//             } else {// this doesn't work until restarting server ***
//                 console.log( " There was an error delivering the message: " + message
//                     + "  statusCode: "+response.statusCode + " error :" + error);
//             }
//         }
//     }
//
//     request(pushChatOptions, pushChatCallback);
// }

module.exports = sender;
