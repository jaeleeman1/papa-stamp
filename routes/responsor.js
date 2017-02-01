var express = require('express'),
    weixin = require('weixin-api'),
    bodyParser = require('body-parser'),
    router = express.Router();
var config = require('../lib/config');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(config.appID, config.appsecret);
var request = require('request');
var getConnection = require('../lib/db_connection');

// Define strings
var templateGreetingMsg = {
    fromUserName : "",
    toUserName : "",
    msgType : "text",
    content : "안녕하세요!\n큐폰 서비스를 이용해 주셔서 감사합니다.\n오전 9시부터 오후 7시까지 답변이 가능하오니, 여행 중 궁금하시거나 요청하실 사항 있으시면 편하게 말씀해 주세요.",
    funcFlag : 0
};

var templateCreateSessionMsg = {
    fromUserName : "",
    toUserName : "",
    msgType : "text",
    content : "Agent와 연결 되었습니다.",
    funcFlag : 0
};

var templateCloseSessionMsg = {
    fromUserName : "",
    toUserName : "",
    msgType : "text",
    content : "Agent와 연결 해제되었습니다.(재연결을 원하시면 메세지를 보내주세요)",
    funcFlag : 0
};

// Define functions
var checkUserAndConnectSeesion = function(user, server) {
    // check user's session status
    api.getClientSessionState(user, function(err, result) {
        console.log("WeChatAPI getClientSessionState done");
        console.log("WeChatAPI getClientSessionState "+err);
        console.log("WeChatAPI getClientSessionState "+JSON.stringify(result));

        if(err == null && result.kf_account != ""){
            // // there are no agent who is asigned
            // api.getOnlineCustomServiceList(function(err, result) {
            // 	console.log("WeChatAPI getOnlineCustomServiceList done");
            // 	console.log("WeChatAPI getOnlineCustomServiceList "+err);
            // 	console.log("WeChatAPI getOnlineCustomServiceList "+JSON.stringify(result));
            // 	if(err) {
            // 		console.log("WeChatAPI Error : "+err);
            // 	} else {
            // 		// search customer which have minimum sessions
            // 		var minAcceptedCnt = -1;
            // 		var minAcceptedCustomer = "";
            // 		for(var i = 0; i < result.kf_online_list.length; i++) {
            // 			console.log("WeChatAPI OnlineCustomer["+i+"] "+result.kf_online_list[i].kf_account+" accepted_case("+result.kf_online_list[i].accepted_case+")");
            // 			if(result.kf_online_list[i].accepted_case > minAcceptedCnt) {
            // 				minAcceptedCnt = result.kf_online_list[i].accepted_case;
            // 				minAcceptedCustomer = result.kf_online_list[i].kf_account;
            // 			}
            // 		}
            // 		// create session
            // 		if(result.kf_online_list.length > 0 && minAcceptedCnt >= 0) {
            // 			console.log("WeChatAPI target customer account("+minAcceptedCustomer+")");
            // 			api.createSession(minAcceptedCustomer, user, function(err) {
            // 				console.log("WeChatAPI createSession : "+err);
            // 			})
            // 		} else {
            // 			// There are no avaiable agent
            // 			console.log("Will transfer this user("+user+") to any agent");
            // 			var resMsg = {
            // 				toUserName : user,
            // 				fromUserName : server,
            // 				msgType : "transfer_customer_service"
            // 			};
            // 			weixin.sendMsg(resMsg);
            // 		}
            // 	}
            // });

            console.log("Will transfer this user("+user+") to any agent");
            var resMsg = {
                toUserName : user,
                fromUserName : server,
                msgType : "transfer_customer_service"
            };
            weixin.sendMsg(resMsg);
        } else if(err == null) {
            // already asigned but session is closed(agent is already assugbed)
            console.log("Will transfer this user("+user+") to agent("+result.kf_account+")");
            var resMsg = {
                toUserName : user,
                fromUserName : server,
                msgType : "transfer_customer_service"
            };
            weixin.sendMsg(resMsg);
        } else {
            // err message isn't empty
            console.log("WeChatAPI checkUserAndConnectSeesion fail");
        }
    });
}

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
            resMsg = '';
            break;
    }

    // To verify server
    weixin.sendMsg('');

    // get access token for debug
    api.getAccessToken(function(err, token) {
        if(err == null) {
            console.log("Access Token : "+JSON.stringify(token));
        }
    });

    // check current user have session.
    // if user have it -> forward message to agent
    // if user haven't it -> create session

    if(resMsg == '') {
        checkUserAndConnectSeesion(msg.fromUserName, msg.toUserName);
    } else {
        weixin.sendMsg(resMsg);
    }

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
    
    var open_id =  msg.fromUserName;
    
    switch (msg.event) {
        case "kf_create_session" :
            // TODO : we can show greeting again
            templateCreateSessionMsg.fromUserName = msg.toUserName;
            templateCreateSessionMsg.toUserName = msg.fromUserName;
            weixin.sendMsg(templateCreateSessionMsg);
            break;
        case "kf_close_session" :
            // TODO : Do we need to add code? because after close session, agent can't ping to user
            // we can show some sentence at this time
            templateCloseSessionMsg.fromUserName = msg.toUserName;
            templateCloseSessionMsg.toUserName = msg.fromUserName;
            weixin.sendMsg(templateCloseSessionMsg);
            break;
        case "kf_switch_session" :
            break;
        case "subscribe" :
            // create menu
            createMenu(open_id);

            templateGreetingMsg.fromUserName = msg.toUserName;
            templateGreetingMsg.toUserName = msg.fromUserName;
            weixin.sendMsg(templateGreetingMsg);

            //getUserInfo(open_id);

            //checkUserAndConnectSeesion(msg.fromUserName, msg.toUserName);

            break;
        case "unsubscribe" :
            deleteUserInfo(open_id);
            break;
        case "CLICK" :
            break;
        case "VIEW" :
            // View event Key
            // TODO : Need to check do we need to add user id into link
            switch(msg.eventKey) {
                case "KEY_SHOPPING" :
                    // TODO :  Link to shopping page
                    break;
                case "KEY_FOOD" :
                    // TODO : Link to food page
                    break;
                case "KEY_TAXI" :
                    // TODO : Link to taxi page
                    break;
            }
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
    weixin.sendMsg('');
});

// Start
router.post('/', function(req, res) {
    console.log("POST start");
    // loop
    weixin.loop(req, res);
    console.log("POST end");
});

function createMenu(openId) {
    console.log(' createMenu start ');

    // get access token for debug
    api.getAccessToken(function(err, token) {
        if(err == null) {
            //console.log("Access Token : "+JSON.stringify(token));
            getUserInfo(token.accessToken, openId);
        }
    });
}

function getUserInfo(new_token, openId) {
    var getUserURL = "https://api.wechat.com/cgi-bin/user/info?access_token="+ new_token +"&openid="+openId+"&lang=en_US";
    var pushChatOptions = {
        method: "GET",
        url: getUserURL
    };

    function pushChatCallback (error, response, body) {
        //console.log("log : " + body);
        if (!error && response.statusCode == 200) {
            console.log("Get User API success");
            bodyObject = JSON.parse(body);
            var nick_name = bodyObject.nickname;
            
            var menu =  {
                "button": [
                    {
                        "type": "view",
                        "name": "전화",
                        "url": "http://v.qq.com/"
                    },
                    {
                        "name": "Request",
                        "sub_button": [
                            {
                                "type": "view",
                                "name": "쇼핑",
                                "url": "http://nbnl.couphone.cn/shopping?nick_name=" + nick_name
                            },
                            {
                                "type": "view",
                                "name": "맛집",
                                "url": "http://nbnl.couphone.cn/food/"
                            },
                            {
                                "type": "view",
                                "name": "택시",
                                "url": "http://nbnl.couphone.cn/taxi/myLocation?wechatId=test02"
                            }
                        ]
                    }
                ]
            };

            api.createMenu(menu, function(err){
                console.log("WeChatAPI createMenu done");
                console.log("WeChatAPI Error : "+err);
            });
            
            insertUserInfo(nick_name, openId);
        }
    }
    request(pushChatOptions, pushChatCallback);
}

function insertUserInfo(nickName, openId) {
    getConnection(function (err, connection) {
        // Insert User Information
        var insertQuery = 'insert into TB_USER_INFO (USER_OPEN_ID, USER_WECHAT_ID, USER_TYPE) values ("' + openId + '", "' +  nickName + '", "01") on DUPLICATE KEY update DEL_YN="N"';
        connection.query(insertQuery, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("### Insert User Information ###");
                console.log("### Data Success ### " + JSON.stringify(row));
            }
            connection.release();
        })
    });
}

function deleteUserInfo(openId) {
    getConnection(function (err, connection) {
        // Delete User Information
        var updateQuery = 'update TB_USER_INFO SET DEL_YN = "Y" WHERE USER_OPEN_ID=?' ;
        connection.query(updateQuery, openId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("### Delete User Information ###");
                console.log("### Data Success ### " + JSON.stringify(row));
            }
            connection.release();
        })
    });
}

module.exports = router;
