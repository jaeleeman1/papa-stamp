var express = require('express'),
    router = express.Router(),
    weixin = require('weixin-api'),
    api = require("../lib/api"),
    bodyParser = require('body-parser'),
    request = require('request'),
    getConnection = require('../lib/db_connection'),
    wechatAPI = require('../lib/wechatApi');

var config = require('../lib/config');
var WechatAPI = require('wechat-api');
var api = new WechatAPI(config.appID, config.appsecret);

var ACCESS_TOKEN = new Object();
var RETURN_DATA = new Object();

router.get('/agentLogin', function(req, res, next) {
    res.render('wechat/loginForm');
});

router.post('/loginSend', function(req, res, next) {
    res.render('wechat/agentWechatForm',{nickName: req.body.nickName });
});

// 택시 출발지 메시지 전송 ( 사용자 -> Agent )
router.post('/taxiDepartSend', function (req, res, next) {
    console.log('##### Post  taxi Start #####');
    // console.log('req ::::::: ', req.body);
    var nickName = 'couphone0001';
    var openId = 'omHN6wbyhFp4du9PD1xKdI6JGdnE';
    var addr = req.body.addr;
    var lat = req.body.lat;
    var lng = req.body.lng;

    getConnection(function (err, connection) {
        var insertQuery = 'INSERT INTO TB_ROAD_INFO (USER_WECHAT_ID, START_TAXI_ADDR_CN, START_WALK_ADDR_CN, START_LONGITUDE_WALK, START_LATITUDE_WALK, START_LONGITUDE_TAXI, START_LATITUDE_TAXI) VALUES ( ?, ?, ?, ?, ?, ?, ?)';
        // Insert Buy List
        connection.query(insertQuery, [nickName, addr, addr, lng, lat, lng, lat], function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                var taxiMsg = "택시 안내 요청 \n현위치 : " + addr;
                var contents = {
                    fromUserName : "",
                    toUserName : openId,
                    msgType : "text",
                    content : taxiMsg,
                    funcFlag : 0
                };

                weixin.sendMsg(contents);
                // api.sender.msgSend(openId, contents);
            }
        })
    });
});

router.post('/sendTaxiMap', function (req, res, next) {
    var openId  = req.body.openId;
    var wechatId  = 'couphone0001';
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
                                                                    toUserName : openId,
                                                                    msgtype : "news",
                                                                    news : {
                                                                    articles: [
                                                                        {
                                                                            title : message,
                                                                            // "description": message,
                                                                            url : mapUrl,
                                                                            picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
                                                                        },
                                                                        {
                                                                            title : "중국어로 목적지 보기",
                                                                            url : messageUrl,
                                                                            picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/photo_face.png"
                                                                        }

                                                                        ]
                                                                     }
                                                                }
                                                weixin.sendMsg(contents);
                                                // api.sender.msgSend(openId, contents);
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

router.post('/sendMessage',function (req, res, next) {
    var opendId = req.body.opendId;
    var message = req.body.message;

    // getConnection(function (err, connection) {
    //     var selectQuery = 'SELECT USER_OPEN_ID FROM TB_USER_INFO WHERE USER_WECHAT_ID = ?';
    //     // selectQuery Open ID
    //     connection.query(selectQuery, wechatId, function (err, row) {
    //         if (err) {
    //             console.error("err : " + err);
    //             throw err;
    //         } else {
    //             var openId = row[0].USER_OPEN_ID;
                var contents = {
                    toUserName : openId,
                    msgtype: "text",
                    content : message,
                    funcFlag : 0
                };

                weixin.sendMsg(contents);
                // api.sender.msgSend(openId, contents);
            // }
        // })
    // });
})

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

// get follower sessionList
router.post('/getFollowerList', function (req, res, next) {
    console.log('##### Post  getFollowerList Start #####');

    var agentNickName = req.body.nickName;

    console.log('agentNickName #### ', agentNickName);

    // get agent account using agentNickName
    wechatAPI.getCustomServiceList(function(err, result) {
        console.log("WeChatAPI getCustomServiceList done");
        // console.log("WeChatAPI getCustomServiceList "+err);
        // console.log("WeChatAPI getCustomServiceList "+JSON.stringify(result));
        if(err) {
            console.log("WeChatAPI getCustomServiceList Error : "+err);
        } else {
            for(var i = 0; i < result.kf_list.length; i++) {
                console.log("WeChatAPI OnlineCustomer["+i+"] "+result.kf_list[i].kf_account+" kf_nick("+result.kf_list[i].kf_nick+")");
                if(result.kf_list[i].kf_nick == agentNickName) {
                    console.log("Nick Name Matched Start");
                    wechatAPI.getCustomerSessionList(result.kf_list[i].kf_account, function(sessionListError, listResult) {
                        if(sessionListError != null) {
                            console.log("WeChatAPI getCustomerSessionList Error : "+sessionListError);
                        } else {

                            console.log("sessionListResult" , listResult);

                            var data = listResult.sessionlist;
                            var indata = new Array();
                            for(var j =0; j< data.length;j++){
                                indata.push( data[j].openid.replace("'", ""));
                            }

                            var charN ='N';

                            getConnection(function (err, connection) {
                                //위챗 아디로 open id 가져오기
                                var query = "SELECT USER_OPEN_ID,USER_WECHAT_ID FROM TB_USER_INFO WHERE DEL_YN = 'N' AND  USER_OPEN_ID IN ( ? )";

                                connection.query(query, indata, function (err, rows) {
                                    if (err) {
                                        console.error("err : " + err);
                                        throw err;
                                    } else {

                                        console.error("rows : ", rows);
                                        res.send({data : rows});
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
});

module.exports = router;
