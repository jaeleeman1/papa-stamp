var express = require('express'),
    weixin = require('weixin-api'),
    bodyParser = require('body-parser'),
    router = express.Router();
var config = require('../lib/config');
var getWechatAPI = require('../lib/wechatApi');
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

// callback(err, result)
var getUserListOfAgent = function(agentNickName, callback){
	// get agent account using agentNickName
	api.getCustomServiceList(function(err, result) {
		// console.log("WeChatAPI getCustomServiceList done");
		// console.log("WeChatAPI getCustomServiceList "+err);
		// console.log("WeChatAPI getCustomServiceList "+JSON.stringify(result));
		if(err) {
			// console.log("WeChatAPI getCustomServiceList Error : "+err);
		} else {
			for(var i = 0; i < result.kf_list.length; i++) {
				// console.log("WeChatAPI OnlineCustomer["+i+"] "+result.kf_list[i].kf_account+
				// 	" kf_nick("+result.kf_list[i].kf_nick+")");
				if(result.kf_list[i].kf_nick == agentNickName) {
					// console.log("Nick Name Matched("+agentNickName+")");
					api.getCustomerSessionList(result.kf_list[i].kf_account, function(err0, result0) {
						if(err0 != null) {
							// console.log("WeChatAPI getCustomerSessionList Error : "+err0);
						} else {
							// return user's info using callback
							callback(err0, result0);
						}
					});
					break;
				} else {

				}
			}
		}
	});
	// get user's of agent using agent account
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
	        var menu =  {
                "button": [
                    {
                        "type": "click",
                        "name": "쇼핑",
                        "key": "KEY_SHOPPING"
                    },
                    {
                        "type": "click",
                        "name": "맛집",
                        "key": "KEY_FOOD"
                    },
                    {
                        "type": "click",
                        "name": "택시",
                        "key": "KEY_TAXI"
                    }
                    // {
                    //     "type": "view",
                    //     "name": "전화",
                    //     "url": "http://v.qq.com/"
                    // },
                    // {
                    //     "name": "Request",
                    //     "sub_button": [
                    //         {
                    //             "type": "view",
                    //             "name": "쇼핑",
                    //             "url": "http://nbnl.couphone.cn/shopping"
                    //         },
                    //         {
                    //             "type": "view",
                    //             "name": "맛집",
                    //             "url": "http://nbnl.couphone.cn/food"
                    //         },
                    //         {
                    //             "type": "view",
                    //             "name": "택시",
                    //             "url": "http://nbnl.couphone.cn/taxi/myLocation"
                    //         }
                    //     ]
                    // }
                ]
            };

            api.createMenu(menu, function(err){
                console.log("WeChatAPI createMenu done");
                console.log("WeChatAPI Error : "+err);
            });

            templateGreetingMsg.fromUserName = msg.toUserName;
            templateGreetingMsg.toUserName = msg.fromUserName;
            weixin.sendMsg(templateGreetingMsg);

            getUserInfo(open_id);

            //checkUserAndConnectSeesion(msg.fromUserName, msg.toUserName);

            break;
        case "unsubscribe" :
            deleteUserInfo(open_id);
            // If there are no message to reply, empty message should be sent
            weixin.sendResponseEmptyMsg();
            break;
        case "CLICK" :
	     switch(msg.eventKey) {
            case "KEY_SHOPPING" :
                sendFirstMsg(open_id, "SHOPPING");
                break;
		    case "KEY_FOOD" :
                sendFirstMsg(open_id, "FOOD");
                break;
            case "KEY_TAXI" :
                sendFirstMsg(open_id, "TAXI");
                break;
            }
            // If there are no message to reply, empty message should be sent
            weixin.sendResponseEmptyMsg();
            break;
        case "VIEW" :
            // View event Key
            // TODO : Need to check do we need to add user id into link
            switch(msg.eventKey) {
                case "KEY_SHOPPING" :
                    // TODO : Link to shopping page
                    break;
                case "KEY_FOOD" :
                    // TODO : Link to food page
                    break;
                case "KEY_TAXI" :
                    // TODO : Link to taxi page
                    break;
            }
            // If there are no message to reply, empty message should be sent
            weixin.sendResponseEmptyMsg();
            break;
        case "LOCATION" :
            console.log("[LOCATION EVENT]["+open_id+"] : ("+msg.latitude+", "+msg.longitude+", "+msg.precision+")");
            weixin.sendResponseEmptyMsg();
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
});

// Start
router.post('/', function(req, res) {
    console.log("POST start");
    // loop
    weixin.loop(req, res);
    console.log("POST end");
});

function sendFirstMsg(open_id, type) {
    console.log(' Get User Info start ');

    // get access token for debug
    api.getAccessToken(function(err, token) {
        if(err == null) {
            //console.log("Access Token : "+JSON.stringify(token));
            getNickName(token.accessToken, open_id, type);
        }
    });
}

function getNickName(new_token, open_id, type) {
    var getUserURL = "https://api.wechat.com/cgi-bin/user/info?access_token="+ new_token +"&openid="+open_id+"&lang=en_US";
    var pushChatOptions = {
        method: "GET",
        url: getUserURL
    };

    function pushChatCallback (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Get User API success");
            bodyObject = JSON.parse(body);
            console.log("Nick name : " + bodyObject.nickname);

            switch(type) {
                case "SHOPPING" :
                    shoppingSendMessage(bodyObject.nickname, open_id);
                    break;
                case "FOOD" :
                    foodSendMessage(bodyObject.nickname, open_id);
                    break;
                case "TAXI" :
                    taxiSendMessage(bodyObject.nickname, open_id);
                    break;
            }
        }
    }
    request(pushChatOptions, pushChatCallback);
}

function shoppingSendMessage(nick_name, open_id) {
    console.log('Start shopping Init send  ');
    var shoppingInitUrl = 'http://nbnl.couphone.cn/shopping?nick_name=' + nick_name;
    var shoppingTitle = "쇼핑 홈페이지로 이동";
    var articles = [
        {
            title : shoppingTitle,
            // "description": message,
            url : shoppingInitUrl,
            description :"쇼핑하러 가기",
            picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/shopping_img.jpg"
        }
    ];

    api.sendNews(open_id, articles, function (err) {
        if (err) {
            console.error("err : " + err);
            throw err;
        }else {
            console.log('Complete shopping Init send');
        }
    });
}

function foodSendMessage(nick_name, open_id) {
    var InitUrl = 'http://nbnl.couphone.cn/food?nickName=' + nick_name;
    var title = "맛집 페이지로 이동";
    var articles = [
        {
            title : title,
            url : InitUrl,
            description :"맛집 찾으러가기",
            picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/food_img.jpg"

        }
    ];

    api.sendNews(open_id, articles, function (err) {
        if (err) {
            console.error("err : " + err);
            throw err;
        }else {
            console.log('Complete food Init send');
        }
    });
}

function taxiSendMessage(nick_name, open_id) {
    var InitUrl = 'http://nbnl.couphone.cn/taxi/myLocation?nickName=' + nick_name;
    var title = "택시 페이지로 이동";
    var articles = [
        {
            title : title,
            url : InitUrl,
            description :"택시요청하기",
            picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/taxi_img.jpg"
        }
    ];

    api.sendNews(open_id, articles, function (err) {
        if (err) {
            console.error("err : " + err);
            throw err;
        }else {
            console.log('Complete taxi Init send');
        }
    });
}


function getUserInfo(open_id) {
    console.log(' createMenu start ');

    // get access token for debug
    api.getAccessToken(function(err, token) {
        if(err == null) {
            //console.log("Access Token : "+JSON.stringify(token));
            getUserAPI(token.accessToken, open_id);
        }
    });
}

function getUserAPI(new_token, open_id) {
    var getUserURL = "https://api.wechat.com/cgi-bin/user/info?access_token="+ new_token +"&openid="+open_id+"&lang=en_US";
    var pushChatOptions = {
        method: "GET",
        url: getUserURL
    };

    function pushChatCallback (error, response, body) {
        //console.log("log : " + body);
        if (!error && response.statusCode == 200) {
            console.log("Get User API success");

	    bodyObject = JSON.parse(body);

	    console.log("Nick name : " + bodyObject.nickname);

            insertUserInfo(bodyObject.nickname, open_id);
        }
    }
    request(pushChatOptions, pushChatCallback);
}

function insertUserInfo(nick_name, open_id) {
    getConnection(function (err, connection) {
        // Insert User Information
        var insertQuery = 'insert into TB_USER_INFO (USER_OPEN_ID, USER_WECHAT_ID, USER_TYPE) values ("' + open_id + '", "' +  nick_name + '", "01") on DUPLICATE KEY update DEL_YN="N"';
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

function deleteUserInfo(open_id) {
    getConnection(function (err, connection) {
        // Delete User Information
        var updateQuery = 'update TB_USER_INFO SET DEL_YN = "Y" WHERE USER_OPEN_ID=?' ;
        connection.query(updateQuery, open_id, function (err, row) {
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

function printSessionList() {
    var agentName = "couphone0004";
    getUserListOfAgent(agentName, function(err, result) {
        if(!err) {
            console.log("*** printSessionList("+agentName+") Success ***");
            console.log(result);
        } else {
            console.log("*** printSessionList("+agentName+") Fail ***");
        }
    });
}

function printAccessToken() {
  api.
  api.getLatestToken(function(err, result) {
    if(!err) {
      console.log("[AccessToken] "+result.isValid()+" ("+result.accessToken+") expireTime("+result.expireTime+") ***");
    } else {
      console.log("*** printAccessToken failed("+err+")***");
    }
  });
}

setInterval(printAccessToken, 60000);

module.exports = router;
