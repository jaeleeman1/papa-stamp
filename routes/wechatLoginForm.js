var express = require('express');
var router = express.Router();
var weixin = require('weixin-api'),
    bodyParser = require('body-parser')
    // request = require('request')


// var appid = 'wx9242b0f3c507cb24';
// var appsec = '3f901f86a389445276b13e1b661935d6';

var WechatAPI = require('wechat-api');
var api = WechatAPI('wx9242b0f3c507cb24','3f901f86a389445276b13e1b661935d6');




/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('start');
  res.render('wechat/loginForm', {wechatSendTitle: 'Couphone Agent Login'});

	/**/
    api.getAccessToken(function(err, token) {
        if(err == null) {
            console.log("Access Token : "+JSON.stringify(token));
        }
    });

		// api.getCustomServiceList( function(err, result){
    //     if(err) {
    //         console.log("getCustomServiceList Error  : "+err);
    //     } else {
    //         console.log("getCustomServiceList Sucess : "+ JSON.stringify(result));
    //     }
    // });

});

router.get('/loginSend', function(req, res, next) {
    console.log('start2');
  res.render('wechat/loginForm', {wechatSendTitle: 'Couphone Agent Login'});





});
 
router.post('/loginSend', function(req, res, next) {

    console.log(' Agent Login start req.body.agentId: ', req.body.agentId );

    // res.render('wechat/agentForm', {wechatSendTitle: 'Couphone Agent Login'});


    res.render('wechat/agentWechatForm',{agentId: req.body.agentId });

});

//
// function getToken(   ) {
//     console.log('##### get token #####');
//     var res;
//     // 단말 1번
//     // var appID = 'wx87ac1cef286fb38d';
//     // var appsecret = '39278936f9e35c2e82ed57f25a05717f';
//
//     // 단말 3번
//     // var appID = 'wx9242b0f3c507cb24';
//     // var appsecret = '3f901f86a389445276b13e1b661935d6';
//
//
//     var accessTokenURL = "https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid="+appID+"&secret="+appsecret;
//     var accessTokenOptions = {
//         method: "GET",
//         url: accessTokenURL,
//     };
//
//     function accessTokenCallback (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             var data = JSON.parse(body);
//             // var ACCESS_TOKEN.access_token = data.access_token;
//             // var ACCESS_TOKEN.expiration = (new Date().getTime()) + (data.expires_in - 10) * 1000;
//
//             console.log( "@@@ 1 "  );
//
//             console.log((JSON.stringify(data)));
//
//             console.log( "@@@ 2 "  );
//
//
//
//         }
//     }
//     console.log( "@@@ 6 "  );
//     request(accessTokenOptions, accessTokenCallback);
//     console.log( "@@@ 7 "  );
//     return res;
// };




module.exports = router;
