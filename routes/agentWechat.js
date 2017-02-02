var express = require('express'),
    router = express.Router(),
    weixin = require('weixin-api'),
    api = require("../lib/api"),
    bodyParser = require('body-parser'),
    request = require('request'),
    getConnection = require('../lib/db_connection'),
    wechatAPI = require('../lib/wechatApi');

// var api = new WechatAPI(config.appID, config.appsecret);

var ACCESS_TOKEN = new Object();
var RETURN_DATA = new Object();

/* GET Agent Wechat Init Page. */
router.get('/agentForm', function (req, res, next) {
    console.log('##### Ger Agent Wechat Start #####');
    res.render('wechat/agentWechatForm');
});

router.post('/sendTaxiMap', function (req, res, next) {
    var wechatId  = req.body.wechatId;
    var endNameCn = req.body.endNameCn;
    var endNameKr = req.body.endNameKr;
    var endAddrCn = req.body.endAddrCn;
    var endAddrKr = req.body.endAddrKr;
    var translationAddrCn = req.body.translationAddrCn;

    console.log(" Start!! RoadAddressUpdate ");

    // GET 위도,경도 via BaiduMap
    var ak = 'HzG9TZi2bzeiGmAPQyV0eAPYzea02TbU';
    var host = 'http://api.map.baidu.com/geocoder/v2/?address=' + endAddrCn + '&output=json&ak=' + ak + '&callback=showLocation';
    request.get({'url': host}, function(error, req, body) {
        if (!error) {

            var json1 = body.split('(');
            var json2 = json1[1].split(')');
            var jsonBody = JSON.parse(json2[0]);

            var lng = jsonBody.result.location.lng;
            var lat = jsonBody.result.location.lat;

            getConnection(function (err, connection) {
                //입력할 값 셋팅 update입력값과 insert 입력값 포맷이 다름 {}, [] 괄호도 다름

                // Taxi 도착지 정보 업데이트
                var query = ' UPDATE TB_ROAD_INFO ' +
                            '  SET END_NM_CN = ?, '+
                            'END_NM_KR = ?, '+
                            'END_TAXI_ADDR_CN = ?, '+
                            'END_TAXI_ADDR_KR =?, '+
                            'END_WALK_ADDR_CN = ?, '+
                            'END_WALK_ADDR_KR = ?, ' +
                            'END_LONGITUDE_WALK = ?, '+
                            'END_LATITUDE_WALK = ?, '+
                            'END_LONGITUDE_TAXI = ?, '+
                            'END_LATITUDE_TAXI = ?, '+
                            'TRANSLATION_ADDR_CN = ? ' +
                            ' WHERE  ROAD_SEQ = (select ROAD_SEQ from (select ROAD_SEQ from TB_ROAD_INFO where USER_WECHAT_ID = ? order by ROAD_SEQ desc limit 1) as TEMP)';

                connection.query(query, [endNameCn, endNameKr, endAddrCn, endAddrKr, endAddrCn, endAddrKr, lng, lat, lng, lat, translationAddrCn, wechatId], function (err, rows) {
                    if (err) {
                        console.error("err : " + err);
                        throw err;
                    } else {

                        getConnection(function (err, connection) {
                            var query = 'select * from TB_ROAD_INFO A, TB_USER_INFO B where A.USER_WECHAT_ID = ? and  A.USER_WECHAT_ID = B.USER_WECHAT_ID  order by A.ROAD_SEQ DESC limit 1;';

                            connection.query(query, wechatId, function (err, rows) {
                                if (err) {
                                    //  console.error("err : " + err);
                                    throw err;
                                }else{
                                    if(rows.length > 0){
                                        var depart = {};
                                        depart.addrTaxi = rows[0].START_TAXI_ADDR_CN;
                                        depart.drivingLong = rows[0].START_LONGITUDE_TAXI ;
                                        depart.drivingLat = rows[0].START_LATITUDE_TAXI;

                                        console.log('depart', depart);

                                        var arrive = {};
                                        arrive.nameCn = rows[0].END_NM_CN;
                                        arrive.nameKr = rows[0].END_NM_KR ;
                                        arrive.addrTaxi = rows[0].END_TAXI_ADDR_CN ;
                                        arrive.drivingLong = rows[0].END_LONGITUDE_TAXI ;
                                        arrive.drivingLat = rows[0].END_LATITUDE_TAXI;

                                        var openId = rows[0].USER_OPEN_ID;
                                        var wechatId = rows[0].USER_WECHAT_ID;
                                        var translationAddrCn = rows[0].TRANSLATION_ADDR_CN;
                                        console.log('arrive', arrive);
                                        host = 'http://api.map.baidu.com/routematrix/v2/driving?output=json&origins='
                                            + depart.drivingLat +','+ depart.drivingLong + '&destinations='+ arrive.drivingLat + ',' + arrive.drivingLong + '&ak=' + ak;

                                        request.get({'url': host}, function(error, req, body){
                                            if(!error){
                                                var jsonBody = JSON.parse(body);

                                                var duration = getDuration(jsonBody.result[0].duration.value);
                                                var distance = getDistance(jsonBody.result[0].distance.value);

                                                console.log(" UPDATE SUCESS ");

                                                var mapUrl = 'http://nbnl.couphone.cn:8080/taxi/transport?id=' + wechatId +'&type=driving'
                                                var messageUrl = 'http://nbnl.couphone.cn:8080/taxi/taxiaddress?name='+ arrive.nameCn +'&address='+ translationAddrCn;  //중국어 보여주는 url
                                                var message    =    "약 " +    duration +" "+ distance  +  "\n";
                                                     message     +=  '도착지 : ' + arrive.nameCn + ' (' + arrive.nameKr + ')';

                                                var contents = {
                                                                    "touser" : openId,
                                                                    "msgtype" : "news",
                                                                    "news" : {
                                                                    "articles": [
                                                                        {
                                                                            "title": message,
                                                                            // "description": message,
                                                                            "url": mapUrl,
                                                                            "picurl": "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
                                                                        },
                                                                        {
                                                                            "title": "중국어로 목적지 보기",
                                                                            "url": messageUrl,
                                                                            "picurl": "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
                                                                        }

                                                                        ]
                                                                     }
                                                                }

                                                api.sender.msgSend(openId, contents);
                                            }
                                        }).on('error', function(e){
                                            console.log(e)
                                        }).end()
                                    }
                                }
                                connection.release();
                            })
                        })
                    }
                    connection.release();
                });
            });
        }
    });
});

router.post('/sendMessage',function (req, res, next) {
    var wechatId = req.body.wechatId;
    var message = req.body.message;

    getConnection(function (err, connection) {
        var selectQuery = 'SELECT USER_OPEN_ID FROM TB_USER_INFO WHERE USER_WECHAT_ID = ?';
        // selectQuery Open ID
        connection.query(selectQuery, wechatId, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                var openId = row[0].USER_OPEN_ID;
                var contents = {
                    "touser" : openId,
                    "msgtype": "text",
                    "text": {
                        "content": message
                    }
                };

                api.sender.msgSend(openId, contents);
            }
        })
    });
})

//
// router.post('/agentWechat', function (req, res, next) {
//     console.log('##### Post Agent Wechat Start #####');
//     console.log("req.body.message: " + req.body.message);
//
//     if (req.body.message == "1") {
//         console.log(" Before!! Select   MaxSeq ");
//         SelectMaxSeq(req, res, next);
//
//     }
//
//     //data send
//     if (req.body.message == "2") {
//         console.log('SendMessage ', req.body);
//         SendMessage(req, res, next);
//     }
//
//
//     if (req.body.message == "3") {
//         console.log('send food rich message ');
//
//         // 리치 메세지를 보내기 위해서 req.body에 추가 데이타를 적재함
//         req.body.UserOpenId = "oiduvwC2PiPzvfPt3e4txGT39gOk";
//         req.body.StartPos = "Chinese Street";
//         req.body.EndPos = "Food Street";
//         req.body.RestruantName = "Chinese Restruant";
//         req.body.Transfortation = "Foot";
//         req.body.Time = "20 (minute)";
//         req.body.Distance = "400(memter)"
//         req.body.ImageUrl = "Http://naver.com"
//
//
//         api.foodResultSender.foodResSend(req, res, next)
//         {
//             console.log(res.statusCode);
//             if (res.statusCode != 200) {
//                 console.log('##### SEND ERROR  #####');
//             }
//             res.status(200).send('Send Sucess');
//         }
//     }
// });

router.post('/shoppingResultSend', function (req, res, next) {
    console.log('##### Post  shoppingResSend Start #####');
    api.sender.shoppingResSend(req, res, next)
    {
        console.log(res.statusCode);
        if (res.statusCode != 200) {
            console.log('##### SEND ERROR  #####');
        }

        res.status(200).send('Send Sucess');
    }
});

// 택시 출발지 메시지 전송 ( 사용자 -> Agent )
router.post('/taxiDepartSend', function (req, res, next) {
    console.log('##### Post  taxi Start #####');
    // console.log('req ::::::: ', req.body);
    var wechatId = req.body.wechatId;
    var openId = req.body.openId;
    var addr = req.body.addr;
    var lat = req.body.lat;
    var lng = req.body.lng;

    getConnection(function (err, connection) {
        var insertQuery = 'INSERT INTO TB_ROAD_INFO (USER_WECHAT_ID, START_TAXI_ADDR_CN, START_WALK_ADDR_CN, START_LONGITUDE_WALK, START_LATITUDE_WALK, START_LONGITUDE_TAXI, START_LATITUDE_TAXI) VALUES ( ?, ?, ?, ?, ?, ?, ?)';
        // Insert Buy List
        connection.query(insertQuery, [wechatId, addr, addr, lng, lat, lng, lat], function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                var taxiMsg = "택시 안내 요청 \n현위치 : " + addr;
                var contents = {
                                    "touser" : openId,
                                    "msgtype": "text",
                                    "text": {
                                                "content": taxiMsg
                                            }
                                };

                api.sender.msgSend(openId, contents);
            }
        })
    });
});


router.post('/foodResultSend', function (req, res, next) {
    console.log('##### Post  foodResSend Start #####');
    api.foodResultSender.foodResSend(req, res, next)
    {
        console.log(res.statusCode);
        if (res.statusCode != 200) {
            console.log('##### SEND ERROR  #####');
        }
        res.status(200).send('Send Sucess');
    }
});
function getRoadInfo(wechatId) {
    console.log('##### get Road info #####');

    var returnData;
    var getUserInfoURL = "http://nbnl.couphone.cn:8080/api/getRoadInfo?wechatId=" + wechatId;
    var getUserInfoOptions = {
        method: "GET",
        url: getUserInfoURL,
    };

    function getUserInfoCallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            console.log('*****' + data.USER_OPEN_ID + '*****');
            RETURN_DATA.openId = data.USER_OPEN_ID;
        }
    }

    request(getUserInfoOptions, getUserInfoCallback);
}

function getUserInfo(wechatId) {
    console.log('##### get user info #####');

    var returnData;
    var getUserInfoURL = "http://nbnl.couphone.cn:8080/api/getUserInfo?wechatId=" + wechatId;
    var getUserInfoOptions = {
        method: "GET",
        url: getUserInfoURL,
    };

    function getUserInfoCallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            console.log('*****' + data.USER_OPEN_ID + '*****');
            RETURN_DATA.openId = data.USER_OPEN_ID;
        }
    }

    request(getUserInfoOptions, getUserInfoCallback);
}

function getToken(openId, sendMessage) {
    console.log('##### get token #####');
    var res;
    // 단말 couphone 1번
    // var appID = 'wx87ac1cef286fb38d';
    // var appsecret = '39278936f9e35c2e82ed57f25a05717f';


    // config.appID = 'wx9aa7c34851e950de';
    // config.appsecret = '84f007b293a60d3d90919308ac29a033';


    var appID = config.appID;
    var appsecret = config.appsecret;



    var accessTokenURL = "https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid=" + appID + "&secret=" + appsecret;
    var accessTokenOptions = {
        method: "GET",
        url: accessTokenURL,
    };

    function accessTokenCallback(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            ACCESS_TOKEN.access_token = data.access_token;
            ACCESS_TOKEN.expiration = (new Date().getTime()) + (data.expires_in - 10) * 1000;

            console.log("@@@ 4 ");
            res = pushChat(openId, sendMessage);
            console.log("@@@ 5 " + res);
        }
    }

    request(accessTokenOptions, accessTokenCallback);
    return res;
};

function pushChat(wechatId, sendMessage) {
    console.log('##### pushChat start #####');
    var res;
    var formatted_message = sendMessage;
    var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token=" + ACCESS_TOKEN.access_token;

    var pushChatOptions = {
        method: "POST",
        url: pushChatURL,
        body: JSON.stringify({
            "touser": wechatId,
            "msgtype": "text",
            "text": {
                "content": formatted_message
            }

        })
    };

    function pushChatCallback(error, response, body) {
        console.log("log : " + body);
        if (!error && response.statusCode == 200) {
            bodyObject = JSON.parse(body);
            if (bodyObject.errmsg === "ok") {
                console.log("Message successfully delivered--" + formatted_message);
                return true;

            } else {
                console.log(" There was an error delivering the message: " + formatted_message
                    + "  statusCode: " + response.statusCode + " error :" + error);

                console.log("@@@ 1 ");

                return bodyObject.errcode;
            }
        }
    }
    request(pushChatOptions, pushChatCallback);
    return res;
}

function SendMessage(req, res, next) {

    var openID;
    //wechat id로 open id 가져오기
    getOpenId(req, res, next);
    console.log("RETURN_DATA.openId " + RETURN_DATA.openId);
    // //오픈아디,메세지로 전송하기
    // getToken(RETURN_DATA.openId, req.body.StartMessage);
    res.status(200).send('Send Message Sucess');
    // res.redirect('/');
    return true;
}

function getOpenId(req, res, next) {
    getConnection(function (err, connection) {
        //위챗 아디로 open id 가져오기
        var query = 'SELECT * FROM TB_USER_INFO WHERE  USER_WECHAT_ID = ?  ORDER BY USER_SEQ DESC LIMIT 1';
        var id = req.body.wechatId;

        connection.query(query, id, function (err, rows) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                console.log("rows1 : " + JSON.stringify(rows));
                var Array = JSON.parse(JSON.stringify(rows));

                RETURN_DATA.openId = Array[0]["USER_OPEN_ID"];
                console.log("Array USER_OPEN_ID ", Array[0]["USER_OPEN_ID"]);
                // res.render('taxiAddressLandscape', { rows : rows });

                req.body.openId = Array[0]["USER_OPEN_ID"];
                //화면에서 주소 등록 인경우 처리

                if (req.body.message == '2') {
                    //오픈아디,메세지로 전송하기
                    getToken(req.body.openId, req.body.StartMessage);
                }
            }
            connection.release();
        })
    })
    console.log("openID : " + RETURN_DATA.openId);
    return true;
}

var getDuration = function(duration) {

    var hour = Math.floor(duration/ (60*60));
    var min =  Math.floor(duration/60 % 60);

    var result = '';
    if(hour != 0){
        result += hour + '시간 ';
    }
    if(min != 0){
        result += min + '분 ';
    }
    return result;
}

var getDistance = function (distance) {
    var kilo = Math.floor(distance/1000);
    var meter = Math.floor(distance%1000);

    var result = '';
    if(kilo != 0 && meter == 0){
        result += kilo + 'km';
    } else if(kilo != 0 && meter != 0){
        result += kilo + '.' + Math.round(meter/100) + 'km ';
    } else if(meter != 0){
        result += meter + 'm ';
    }
    return result;
}


////////////////////////////////////
// Test for getUserListOfAgent
////////////////////////////////////
router.post('/getUserAlias', function (req, res, next) {
    console.log('##### Post  getUserAlias Start #####');
    console.log('agentId #### ', req.body.agentId);

    //agent의 키 를 가져오는 함수
   getUserListOfAgent(req.body.agentId, function(err, result){
        console.log("WeChatAPI getUserListOfAgent done");
        console.log("userList ::::::: ", result);

    });
});


// callback(err, result)
var getUserListOfAgent = function(agentNickName, callback){
    // get agent account using agentNickName
    wechatAPI.getCustomServiceList(function(err, result) {
        console.log("WeChatAPI getCustomServiceList done");
        console.log("WeChatAPI getCustomServiceList "+err);
        console.log("WeChatAPI getCustomServiceList "+JSON.stringify(result));
        if(err) {
            console.log("WeChatAPI getCustomServiceList Error : "+err);
        } else {
            for(var i = 0; i < result.kf_list.length; i++) {
                console.log("WeChatAPI OnlineCustomer["+i+"] "+result.kf_list[i].kf_account+
                    " kf_nick("+result.kf_list[i].kf_nick+")");
                if(result.kf_list[i].kf_nick == agentNickName) {
                    console.log("Nick Name Matched");
                    wechatAPI.getCustomerSessionList(result.kf_list[i].kf_account, function(err0, result0) {
                        if(err0 != null) {
                            console.log("WeChatAPI getCustomerSessionList Error : "+err0);
                        } else {
                            // return user's info using callback
                            console.log("WeChatAPI getCustomerSessionList Done" + JSON.stringify(result0) + "cnt :" + result0.length);

                            // [ a1, a2,a3,0 ]
                            var indata = '[';
                            for(var j =0; j< resul0.length - 1;j++){
                                indata += result0[j].openId;
                                indata += ',';
                            }

                            indata +=  result0[resul0.length-1].openId + ']';

                            console.log('indata :: ' , indata);

                            getConnection(function (err, connection) {
                                //위챗 아디로 open id 가져오기
                                var query = 'SELECT USER_OPEN_ID,USER_WECHAT_ID FROM TB_USER_INFO WHERE  USER_OPEN_ID IN (?) AND DEL_YN = N  ';


                                connection.query(query, indata, function (err, rows) {
                                    if (err) {
                                        console.error("err : " + err);
                                        throw err;
                                    } else {

                                        console.error("rows : ", rows);

                                        return rows;

                                        // console.log("rows1 : " + JSON.stringify(rows));
                                        // var Array = JSON.parse(JSON.stringify(rows));
                                        //
                                        // //화면에 적재
                                        //
                                        // for (var k=0; k< Array.length; k++){
                                        //     console.log( k + Array[k].USER_OPEN_ID + Array[k].USER_WECHAT_ID + '\N');
                                        // }
                                    }
                                    connection.release();
                                })
                            })
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


//
// function RoadAddressInsert(req, res, next) {
//     console.log(" Start!! RoadAddressInsert ");
//
//     getConnection(function (err, connection) {
//         if (JSON.stringify(req.body) == '{}') {
//             res.status(404);
//             res.json({
//                 "success": 0,
//                 "message": "Parameters missing"
//             });
//             return false;
//         }
//         //입력할 값 셋팅
//         var road_info_set =
//             {
//                 'USER_WECHAT_ID': req.body.wechatId,
//                 'START_NM_CN': req.body.StartCn,
//                 'START_NM_KR': req.body.StartKr,
//                 'END_NM_CN': req.body.EndCn,
//                 'END_NM_KR': req.body.EndKr
//             };
//
//         //insert 문장
//         var query = 'INSERT INTO TB_ROAD_INFO SET  ?';
//
//         connection.query(query, road_info_set, function (err, rows) {
//             if (err) {
//                 console.error("err : " + err);
//                 throw err;
//             } else {
//                 console.log(" INSERT SUCESS ");
//                 res.status(200).send('Insert Sucess');
//
//                 return true;
//             }
//             connection.release();
//         });
//     });
//
//     return true;
// }

//
// function RoadAddressUpdate(req, res, next) {
//     console.log(" Start!! RoadAddressUpdate ");
//
//     getConnection(function (err, connection) {
//         if (JSON.stringify(req.body) == '{}') {
//             res.status(404);
//             res.json({
//                 "success": 0,
//                 "message": "Parameters missing"
//             });
//             return false;
//         }
//
//         //입력할 값 셋팅 update입력값과 insert 입력값 포맷이 다름 {}, [] 괄호도 다름
//         var road_info_set =
//             [
//                 req.body.EndCn,
//                 req.body.EndKr,
//                 req.body.LargeAddrCn,
//                 req.body.roadSeq,
//                 req.body.wechatId
//             ];
//
//         //insert 문장
//         var query = ' UPDATE TB_ROAD_INFO ' +
//             ' SET  END_NM_CN      = ?, ' +
//             'END_NM_KR       = ?, ' +
//             'LARGE_ADDR_CN   = ?  ' +
//             ' WHERE  ROAD_SEQ     = ?  ' +
//             ' AND  USER_WECHAT_ID  = ?  ';
//
//
//         connection.query(query, road_info_set, function (err, rows) {
//             if (err) {
//                 console.error("err : " + err);
//                 throw err;
//             } else {
//                 console.log(" UPDATE SUCESS ");
//                 res.status(200).send('UPDATE Sucess');
//
//                 return true;
//             }
//             connection.release();
//         });
//     });
//
//     return true;
// }

//
// function SelectMaxSeq(req, res, next) {
//
//     getConnection(function (err, connection) {
//
//         //위챗 아디로 max seq 가져오기
//         var query = ' SELECT A.ROAD_SEQ   ' +
//             'FROM  TB_ROAD_INFO  A ' +
//             'WHERE A.USER_WECHAT_ID = ?         ' +
//             'ORDER BY A.ROAD_SEQ   DESC        LIMIT 1';
//
//         var id = req.body.wechatId;
//
//
//         connection.query(query, id, function (err, rows) {
//             if (err) {
//                 //  console.error("err : " + err);
//                 throw err;
//             } else {
//                 console.log("rows1 : " + JSON.stringify(rows));
//
//                 var Array = JSON.parse(JSON.stringify(rows));
//
//                 req.body.roadSeq = Array[0]["ROAD_SEQ"];
//                 //화면에서 주소 등록 인경우 처리
//                 if (req.body.message == '1') {
//                     console.log(" Before!! RoadAddress Update ");
//                     RoadAddressUpdate(req, res, next);
//                 }
//
//             }
//
//             connection.release();
//         })
//     })
//
//
//     console.log("openID : " + RETURN_DATA.openId);
//     return true;
// }

module.exports = router;
