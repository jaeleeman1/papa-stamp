var express = require('express'),
    router = express.Router();
    weixin = require ( 'weixin-api' ),
    api = require("../lib/api"),
    bodyParser = require('body-parser');

/////////
var request = require('request');;
var ACCESS_TOKEN = new Object();
var getConnection = require('./db');


router.get('/', function(req, res, next) {
    console.log('start get');
    if (weixin.checkSignature(req)) {
        res.status(200).send(req.query.echostr);
    } else {
        res.status(500).send('token error!');
    }

});

router.post('/', function(req, res, next) {
    console.log('start post');

    var message = {};
    api.message.receive(req, function (obj) {
        //console.log(obj);

        if(obj.Content == "Text") {
            message = api.message.replay.text(obj, "Couphone Service");
            res.status(200).send(message);
        } else if (obj.Content == "Image") {
            getToken(req.query.openid);
            message = '';
            res.status(200).send(message);
        } else if (obj.Content == "Link") {
            message = api.message.replay.text(obj, "link");
            res.status(200).send(message);
        } else {
            message = '';
            res.status(200).send(message);
        }


        WechatMessageInsert(req,obj);

    });
});


var WechatMessageInsert = function(req,obj,res){

    getConnection(function (err, connection) {

        var query = 'INSERT INTO TB_WECHAT_DIALOGUE_HIS ' +
            '		 ( FROM_USER_NAME, TO_USER_NAME, DIAL_DATE, DIAL_CONTENT,DEL_YN )  ' +
            'VALUES ( ?,?,?,?,?)  ';

        var from_user_name = obj.FromUserName;
        var to_user_name   = obj.ToUserName;
        var dial_date = new Date().getTime();
        var dial_content = obj.Content;
        var del_yn    = 'N';

        connection.query(query, from_user_name , to_user_name ,  dial_date , dial_content , del_yn   , function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                console.log(" INSERT SUCESS " );
                // res.render('foodShopInfo', {rows : rows, length:rows.length});
            }
            connection.release();
        })
    })
}




////////////
function getToken(openId) {
    console.log(' get token start ');

    var appID = 'wx87ac1cef286fb38d';
    var appsecret = '39278936f9e35c2e82ed57f25a05717f';

    //official (3번)
    // var appID = 'wx9242b0f3c507cb24';
    // var appsecret = '3f901f86a389445276b13e1b661935d6';



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
