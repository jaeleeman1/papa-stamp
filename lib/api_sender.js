// var weixin = require("./weixin-api/index.js");
// var express = require('express');
// var router = express.Router();
var request = require('request');

var sender = {};


var ACCESS_TOKEN = new Object();

sender.shoppingResSend =  function(req, res) {
	console.log('start post : shopping result send  ');

    var ProductSet  =  JSON.parse(JSON.stringify(req.body));

    console.log('ProductSet : ' + ProductSet.User_Open_Id);
    console.log('ProductName : ' + ProductSet.Prdct[0].Prdct_Nm);
    console.log('Product length : ' + ProductSet.Prdct.length);



    if(ProductSet == '{}') {
        console.log('error : 400');
        return false;
    }



    var total_amount    = 0;
	var shoppingResult  = '--------------------------------------- \n';
    for(var i = 0; i <  ProductSet.Prdct.length; i++)
	{

		shoppingResult += 	ProductSet.Prdct[i].Prdct_Nm + "상품을 " +
        					ProductSet.Prdct[i].Prdct_Cnt+ "개 구매 하였습니다. \n"

		total_amount += ProductSet.Prdct[i].Price * ProductSet.Prdct[i].Prdct_Cnt;
	}
    shoppingResult += '--------------------------------------- \n';
    shoppingResult += "전체 금액은 " + total_amount +" 위안  입니다."

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

                
                // var wechatId = 'oH7FywN073pRVpCF0G6nMl6iI8mg';


                console.log(' get token start3 ');

            }else{
                console.log(' get token start 5');
            }
        }
        console.log(' get token start 4');
        request(accessTokenOptions, accessTokenCallback);
    };

    //token 받고 조립한 결과 전송
    getToken( pushChat(ProductSet.User_Open_Id,shoppingResult) );

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
                    res.status(200).send('Send Sucess');
					
				} else {// this doesn't work until restarting server ***
					console.log( " There was an error delivering the message: " + formatted_message  
					             + "  statusCode: "+response.statusCode + " error :" + error);
				}
			}
		}

		request(pushChatOptions, pushChatCallback);
	}

module.exports = sender;
 

//   cd /usr/local/node/Example/kimkim/ExampleWechat_Sender/




