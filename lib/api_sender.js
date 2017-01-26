var request = require('request');
var sender = {};
var ACCESS_TOKEN = new Object();

sender.shoppingResSend =  function(req, res) {
    console.log('start post : shopping result send  ');

    var ProductSet = req.body;
    // var ProductSet = JSON.stringify(req.body);

    console.log('Product User_Open_Id : ' + ProductSet.User_Open_Id);
    console.log('Product Prdct_Nm : ' + ProductSet.Prdct_Nm);
    console.log('Product Prdct_Cnt : ' + ProductSet.Prdct_Cnt);
    console.log('Product Price : ' + ProductSet.Price);

    var prdctLength = ProductSet.Prdct_Nm.length;

    if(JSON.stringify(ProductSet) == '{}') {
        console.log('error : 400');
        return false;
    }

    var total_amount    = 0;
    var shoppingResult  = prdctLength +'개 물품 주문 접수 되었습니다. \n';

    shoppingResult  += '--------------------------------------- \n';
    for(var i = 0; i <  prdctLength; i++)
    {
        shoppingResult += 	ProductSet.Prdct_Nm[i] + "\n " +
            ": 수량"+ProductSet.Prdct_Cnt[i] + "개 |" +
            "￥ " + ProductSet.Price[i] * ProductSet.Prdct_Cnt[i] + "\n "

        total_amount += ProductSet.Price[i] * ProductSet.Prdct_Cnt[i];
    }

    shoppingResult += "\n 합계 ￥" + total_amount ;
    shoppingResult += '\n --------------------------------------- \n';

    // console.log( shoppingResult);
    getShoppingToken();

    function getShoppingToken() {
        console.log(' get token start ');

        //official (no.1)
        var appsecret = 'bba43e076e9657150c0c13729e79d522';
        var appID = 'wxbe787e4d4b341259';
        // var appID = 'wx87ac1cef286fb38d';
        // var appsecret = '39278936f9e35c2e82ed57f25a05717f';


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
                pushShoppingChat( ProductSet.User_Open_Id, shoppingResult );

            }else{
                console.log(' get token start 5');
            }
        }
        console.log(' get token start 4');
        request(accessTokenOptions, accessTokenCallback);
    };

    console.log(' get token end ');
    return true;
};

function pushShoppingChat(openId, Result) {
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

sender.msgSend =  function(openId, contents) {

    if(JSON.stringify(contents) == '{}') {
        console.log('error : 400');
        return false;
    }

    sendMessage(openId, contents);

    console.log(' get token end final ');
    return true;
};

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

            var contents = "택시 안내 요청 현위치 : 上海市上海市黄浦区百翎路1号";

            pushChat( openId, contents, ACCESS_TOKEN);
        }else{
        }
    }
    request(accessTokenOptions, accessTokenCallback);
};

function pushChat(openId, contents, token) {
    console.log(' pushChat start ');

    console.log('msg-openId', openId);
    console.log('msg-contents', contents);

    var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+token.access_token;

    var pushChatOptions = {
        method: "POST",
        url: pushChatURL,
        body: JSON.stringify({
            "touser" : openId,
            "msgtype":"text",
            "text":
                {
                    "content": contents
                }
        })
    };

    console.log('pushChatOptions :::::::::: ', pushChatOptions);
    console.log('################################################')

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


sender.foodResSend =  function(req, res) {
    console.log('start post : food result send  ' + req);

    var FoodSet  =  JSON.parse(JSON.stringify(req.body));

    console.log(' FoodSet : ' + JSON.stringify(req.body));


    if(FoodSet == '{}') {
        console.log('error : 400');
        return false;
    }
    var foodMessage  =    "--------------------------------------- \n";
    foodMessage     += 	 " 출발 : " + FoodSet.StartPos +  " \n ";
    foodMessage     +=    "--------------------------------------- \n";
    foodMessage     +=    " 도착 :" + FoodSet.EndPos +  " \n";
    foodMessage     +=    FoodSet.Transfortation +    FoodSet.Time + "분 " + FoodSet.Distance  +  " \n ";;
    foodMessage     +=    "--------------------------------------- \n ";


    console.log( foodMessage);


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

                console.log(' get token start3 ');
                //token 받고 조립한 결과 전송
                foodPushChat(  FoodSet.UserOpenId,foodMessage,FoodSet.ImageUrl , FoodSet.RestruantName   );

            }else{
                console.log(' get token start 5');
            }
        }
        console.log(' get token start 4');
        request(accessTokenOptions, accessTokenCallback);
    };

    getToken();

    console.log(' get token end ');
    return true;
} ;

function foodPushChat(openId, message, ImageUrl , Restruant  ) {
    console.log(' pushChat start ');

    var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+ACCESS_TOKEN.access_token;

    var pushChatOptions = {
        method: "POST",
        url: pushChatURL,
        body: JSON.stringify({
            "touser" : openId,
            "msgtype" : "news",
            "news" : {
                "articles": [
                    {
                        "title": Restruant,
                        "description": message,
                        "url": ImageUrl,
                        "picurl": "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
                    },
                    {
                        "title": "중국어 도착지",
                        "url": "http://52.79.56.181:8000/taxiaddress?useropenid="+openId,  //중국어 보여주는 url + OPENID
                        "picurl": "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
                    }

                ]
            }
        })
    };

    function pushChatCallback (error, response, body) {

        if (!error && response.statusCode == 200) {
            bodyObject = JSON.parse(body);
            if (bodyObject.errmsg === "ok") {
                console.log("Message successfully delivered--"  );
                // res.status(200).send('Send Sucess');

            } else {// this doesn't work until restarting server ***
                console.log( " There was an error delivering the message: " + message
                    + "  statusCode: "+response.statusCode + " error :" + error);
            }
        }
    }

    request(pushChatOptions, pushChatCallback);
}

module.exports = sender;