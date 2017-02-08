var express = require('express'),
    router = express.Router(),
    weixin = require('weixin-api'),
    api = require("../lib/api"),
    bodyParser = require('body-parser'),
    request = require('request'),
    getConnection = require('../lib/db_connection'),
    wechatAPI = require('../lib/wechatApi'),
    app = express(),
    path = require('path'),
    http = require('http');

var ACCESS_TOKEN = new Object();
var RETURN_DATA = new Object();

app.use(express.static(path.join(__dirname, 'public')));
var httpServer = http.createServer(app).listen(8060, function(req,res){
	console.log('Socket Connect Success');
});

var io = require('socket.io').listen(httpServer);
io.sockets.on('connection', function (socket) {
    socket.on('nbnlServer', function (data) {
	    
	  console.log('nbnlServer :::: data ', data);
	    if(sendData.type == 'saveMsg'){
		socket.emit('saveMsg', data);
	    }else if(sendData.type == 'turnRed'){
		socket.emit('turnRed', data);    
	    }
         
        // socket.broadcast.emit('nbnl agent', sendData);
    });
});

router.get('/agentLogin', function(req, res, next) {
    res.render('wechat/loginForm');
});

router.post('/historyMessage', function(req, res, next) {
    var historyWechatId = req.body.historyWechatId;
    var historyMessage = req.body.historyMessage;
    console.log('historyWechatId' + historyWechatId);
    console.log('historyMessage' + historyMessage);

    //res.render('wechat/loginForm', {historyWechatId: historyWechatId, historyMessage: historyMessage});
});

router.post('/loginSend', function(req, res, next) {
    res.render('wechat/agentWechatForm',{nickName: req.body.nickName, listLength : 0 });
});

// 택시 출발지 메시지 전송 ( 사용자 -> Agent )
router.post('/taxiDepartSend', function (req, res, next) {

    var nickName = req.body.nickName;
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
                getConnection(function (err, connection) {
                    var selectQuery = "SELECT USER_WECHAT_ID, USER_OPEN_ID FROM TB_USER_INFO WHERE USER_WECHAT_ID = ? AND USER_TYPE = '01'";
                    connection.query(selectQuery, nickName, function (err, row) {
                        if (err) {
                            console.error("err : " + err);
                            throw err;
                        } else {
                            var openId = row[0].USER_OPEN_ID;
                            var taxiMsg = "택시 안내 요청 \n현위치 : " + addr;

                            wechatAPI.sendText(openId, taxiMsg, function() {
                                console.log('complete depart msg');
                            }); // senText end
                        };// select query end
                    });// query connection end
                });
            }
        })
    });
});

router.post('/sendTaxiMap', function (req, res, next) {

    var openId  = req.body.openId;
    var nickName  = req.body.nickName;
    var endNameCn = req.body.endNameCn;
    var endNameKr = req.body.endNameKr;
    var endAddrCn = req.body.endAddrCn;
    var endAddrKr = req.body.endAddrKr;
    var translationAddrCn = req.body.translationAddrCn;

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

                connection.query(query, [endNameCn, endNameKr, endAddrCn, endAddrKr, endAddrCn, endAddrKr, lng, lat, lng, lat, translationAddrCn, nickName], function (err, rows) {
                    if (err) {
                        console.error("err : " + err);
                        throw err;
                    } else {

                        getConnection(function (err, connection) {
                            var query = 'select * from TB_ROAD_INFO A, TB_USER_INFO B where A.USER_WECHAT_ID = ? and  A.USER_WECHAT_ID = B.USER_WECHAT_ID  order by A.ROAD_SEQ DESC limit 1;';

                            connection.query(query, nickName, function (err, rows) {
                                if (err) {
                                    //  console.error("err : " + err);
                                    throw err;
                                }else{
                                    if(rows.length > 0){
                                        var depart = {};
                                        depart.addrTaxi = rows[0].START_TAXI_ADDR_CN;
                                        depart.drivingLong = rows[0].START_LONGITUDE_TAXI ;
                                        depart.drivingLat = rows[0].START_LATITUDE_TAXI;

                                        var arrive = {};
                                        arrive.nameCn = rows[0].END_NM_CN;
                                        arrive.nameKr = rows[0].END_NM_KR ;
                                        arrive.addrTaxi = rows[0].END_TAXI_ADDR_CN ;
                                        arrive.drivingLong = rows[0].END_LONGITUDE_TAXI ;
                                        arrive.drivingLat = rows[0].END_LATITUDE_TAXI;

                                        var openId = rows[0].USER_OPEN_ID;
                                        var nickName = rows[0].USER_WECHAT_ID;
                                        var translationAddrCn = rows[0].TRANSLATION_ADDR_CN;
                                        host = 'http://api.map.baidu.com/routematrix/v2/driving?output=json&origins='
                                            + depart.drivingLat +','+ depart.drivingLong + '&destinations='+ arrive.drivingLat + ',' + arrive.drivingLong + '&ak=' + ak;

                                        request.get({'url': host}, function(error, req, body){
                                            if(!error){
                                                var jsonBody = JSON.parse(body);

                                                var duration = getDuration(jsonBody.result[0].duration.value);
                                                var distance = getDistance(jsonBody.result[0].distance.value);

                                                var mapUrl = 'http://nbnl.couphone.cn/taxi/transport?nickName=' + nickName +'&type=driving'
                                                var messageUrl = 'http://nbnl.couphone.cn/taxi/taxiaddress?name='+ arrive.nameCn +'&address='+ translationAddrCn;  //중국어 보여주는 url
                                                var message    =    "약 " +    duration +" "+ distance  +  "\n";
                                                     message     +=  '도착지 : ' + arrive.nameCn + ' (' + arrive.nameKr + ')';
                                                var articles = [
                                                                    {
                                                                        title : message,
                                                                        // "description": message,
                                                                        url : mapUrl,
                                                                        picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/taxi/google-map.png"
                                                                    },
                                                                    {
                                                                        title : "중국어로 목적지 보기",
                                                                        url : messageUrl,
                                                                        picurl : "https://s3.ap-northeast-2.amazonaws.com/cphone-storage/couphone_image/taxi/google-map.png"
                                                                    }

                                                                ];

                                                wechatAPI.sendNews(openId, articles, function () {
						    res.send('complete arrival msg');
                                                    console.log('complete arrival msg');
                                                });
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

router.post('/sendFoodMap', function (req, res, next) {

    // var openId  = 'omHN6wbyhFp4du9PD1xKdI6JGdnE';
    // var wechatId  = 'couphone0001';
    var nickName = req.body.nickName;
    var foodId = req.body.foodId;
    var duration = req.body.duration;
    var distance = req.body.distance;
    var arriveName = req.body.arriveName;
    var departAddr = req.body.departAddr;
    var departLat = req.body.departLat;
    var departLong = req.body.departLong;

    getConnection(function (err, connection) {
        var selectQuery = "SELECT A.USER_OPEN_ID, B.IMG_URL FROM TB_USER_INFO A, TB_FOOD_SHOP_LIST B WHERE A.USER_WECHAT_ID = ? AND B.FOOD_ID = ? AND A.USER_TYPE = '01'";
        connection.query(selectQuery, [nickName, foodId], function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {

                var openId = row[0].USER_OPEN_ID;
                var pictureUrl = row[0].IMG_URL;

                var mapUrl = 'http://nbnl.couphone.cn/food/transport?id='+ foodId + '&type=walking&address=' + departAddr + '&lat=' + departLat + '&lng=' + departLong + '&nickName="!@#$"';
                var message    =    "약 " +    duration +" "+ distance  +  "\n";
                message     +=  '도착지 : ' + arriveName;

                var articles = [
                    {
                        title : message,
                        url : mapUrl,
                        picurl : pictureUrl
                    },
                    {
                        title : "",
                        url : mapUrl,
                        picurl : ""
                    }
                ];
                wechatAPI.sendNews(openId, articles, function () {
                    console.log('complete food msg');
                });// sendNews end
            };// select query end
        });// query connection end
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
    var openId = req.body.openId;
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
    //             var contents = {
    //                 toUserName : openId,
    //                 msgtype: "text",
    //                 content : message,
    //                 funcFlag : 0
    //             };


                wechatAPI.sendText(openId, message, function(){
                    console.log('complete basic message');
                });
                // weixin.sendMsg(contents);
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

                            if(data.length < 1){
                                res.send({data : false});
                            }else{
                                getConnection(function (err, connection) {
                                    //위챗 아디로 open id 가져오기

                                    var indata = '';
                                    for(var j =0; j< data.length;j++){
                                        indata += "'" + data[j].openid + "',";
                                    }
                                    indata = indata = indata.slice(0, -1);

                                    var query = "SELECT USER_OPEN_ID,USER_WECHAT_ID FROM TB_USER_INFO WHERE DEL_YN = 'N' AND  USER_OPEN_ID IN ("  + indata  + ")";

                                    connection.query(query, function (err, rows) {
                                        if (err) {
                                            console.error("err : " + err);
                                            throw err;
                                        } else {

                                            console.error("rows : ", rows);
                                            res.send({data : rows, listLength: rows.length});
                                        }
                                        connection.release();
                                    })
                                })
                            }
                        }
                    });
                    break;
                } else {

                }
            }
        }
    });
});

// 대화내용 저장
router.post('/saveMessage', function (req, res, next) {
	console.log("saveMessage :: ", req.body);
	
	var fromNickName = req.body.fromNickName;
	var toNickName = req.body.toNickName;
	var contentType = req.body.contentType;
	var contents = req.body.contents;

    getConnection(function (err, connection) {
        var insertQuery = 'INSERT INTO TB_WECHAT_HIS_DIALOGUE (FROM_OPEN_ID, TO_OPEN_ID, CONTENT_TYPE, DIAL_CONTENT) VALUES ( ?, ?, ?, ?)';
        connection.query(insertQuery, [fromNickName, toNickName, contentType, contents], function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
                res.send({data : toNickName});
            }
        })
    });
});

// 대화내용 
router.post('/readMessage', function (req, res, next) {
	var agent = req.body.agent;
	var user = req.body.user;

    getConnection(function (err, connection) {
        var selectQuery = 'select * from TB_WECHAT_HIS_DIALOGUE where FROM_OPEN_ID = ? and TO_OPEN_ID = ? order by REG_DT DESC';
	var updateQuery = " UPDATE TB_WECHAT_HIS_DIALOGUE " +
                            "  SET READ_YN = ? "+
                            " WHERE FROM_OPEN_ID = ? AND TO_OPEN_ID = ? AND READ_YN = 'false'";

        connection.query(selectQuery, [agent, user], function (err, selectRow) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {
		connection.query(updateQuery, ['true', agent, user], function (err, updateRow) {
		    if (err) {
			console.error("err : " + err);
			throw err;
		    } else {
			res.send({data : selectRow});
		    }
        	})
            }//end if(err)
        });
    });
});
module.exports = router;
