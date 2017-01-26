var express = require('express'),
    router = express.Router(),
    weixin = require ( 'weixin-api' ),
    api = require("../lib/api"),
    bodyParser = require('body-parser'),
    request = require('request'),
    getConnection = require('../lib/db_connection');

var ACCESS_TOKEN = new Object();
var RETURN_DATA = new Object();

/* GET Agent Wechat Init Page. */
router.get('/', function(req, res, next) {
    console.log('##### Ger Agent Wechat Start #####');
    res.render('wechat/agentWechatForm', {wechatSendTitle: 'Wechat Message Tool'});
});

router.get('/agentWechat', function(req, res, next) {
    console.log('##### Get Agent Wechat Start #####');
    res.render('wechat/agentWechatForm', {wechatSendTitle: 'Wechat Message Tool'});
});

router.post('/agentWechat', function(req, res, next) {
    console.log('##### Post Agent Wechat Start #####');
    console.log("req.body.message: " + req.body.message);

    if (req.body.message == "1")
    {
        console.log(" Before!! Select   MaxSeq ");
        SelectMaxSeq(req,res,next);

    }

    //data send
    if (req.body.message == "2")
    {
        console.log('SendMessage ',req.body);
        SendMessage(req, res, next);
    }


    if (req.body.message == "3")
    {
        console.log('send food rich message ' );

        // 리치 메세지를 보내기 위해서 req.body에 추가 데이타를 적재함
        req.body.UserOpenId = "oiduvwC2PiPzvfPt3e4txGT39gOk";
        req.body.StartPos = "Chinese Street";
        req.body.EndPos =  "Food Street";
        req.body.RestruantName = "Chinese Restruant";
        req.body.Transfortation = "Foot";
        req.body.Time = "20 (minute)";
        req.body.Distance = "400(memter)"
        req.body.ImageUrl = "Http://naver.com"


        api.foodResultSender.foodResSend( req , res, next)
        {
            console.log( res.statusCode );
            if ( res.statusCode != 200) {
                console.log('##### SEND ERROR  #####');
            }
            res.status(200).send('Send Sucess');
        }
    }
});

router.post('/shoppingResultSend', function(req, res, next) {
    console.log('##### Post  shoppingResSend Start #####');
    api.sender.shoppingResSend( req , res, next)
    {
        console.log(   res.statusCode );
        if (  res.statusCode != 200) {
            console.log('##### SEND ERROR  #####');
        }

        res.status(200).send('Send Sucess');
    }
});

router.post('/taxiDepartSend', function(req, res, next) {
    console.log('##### Post  taxi Start #####');
    // console.log('req ::::::: ', req.body);

	var openId = req.body.openId;
	var addr = req.body.addr;
	var lat = req.body.lat;
	var lng = req.body.lng;

    getConnection(function (err, connection) {
        var insertQuery =  'INSERT INTO TB_ROAD_INFO (USER_WECHAT_ID, START_TAXI_ADDR_CN, START_WALK_ADDR_CN, START_LONGITUDE_WALK, START_LATITUDE_WALK, START_LONGITUDE_TAXI, START_LATITUDE_TAXI) VALUES ( ?, ?, ?, ?, ?, ?, ?)';
        // Insert Buy List
        connection.query(insertQuery, [openId, addr, addr, lng, lat,lng, lat],  function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            } else {

                var taxiMsg = "택시 안내 요청 \n현위치 : 上海市上海市黄浦区百翎路1号";
                // taxiMsg+= '택시 안내 요청 \n현위치 : ' + addr;

                // console.log('openId', openId);
                // console.log('taxiMsg', taxiMsg);

                api.sender.msgSend(openId, taxiMsg);
                // api.sender.msgSend(openId, taxiMsg);
                // {
                    // console.log(   res.statusCode );
                    // if (  res.statusCode != 200) {
                    //     console.log('##### SEND ERROR  #####');
                    // }else{
                    //     res.status(200).send('Send Sucess');
                    // }
                // }
            }
        })
    });
});


router.post('/foodResultSend', function(req, res, next) {
    console.log('##### Post  foodResSend Start #####');
    api.foodResultSender.foodResSend( req , res, next)
    {
        console.log(   res.statusCode );
        if (  res.statusCode != 200) {
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

    function getUserInfoCallback (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            console.log('*****'+ data.USER_OPEN_ID + '*****');
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

    function getUserInfoCallback (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            console.log('*****'+ data.USER_OPEN_ID + '*****');
            RETURN_DATA.openId = data.USER_OPEN_ID;
        }
    }
    request(getUserInfoOptions, getUserInfoCallback);
}

function getToken(openId,sendMessage) {
    console.log('##### get token #####');
    var res;
    // 단말 couphone 1번
    var appID = 'wx87ac1cef286fb38d';
    var appsecret = '39278936f9e35c2e82ed57f25a05717f';

    // 3번 단말
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

            console.log( "@@@ 4 "  );
            res = pushChat(openId,sendMessage);
            console.log( "@@@ 5 " + res  );
        }
    }
    request(accessTokenOptions, accessTokenCallback);
    return res;
};

function pushChat(wechatId,sendMessage) {
    console.log('##### pushChat start #####');
    var res ;
    var formatted_message = sendMessage  ;
    var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+ACCESS_TOKEN.access_token;

    var pushChatOptions = {
        method: "POST",
        url: pushChatURL,
        body: JSON.stringify({
            "touser": wechatId,
            "msgtype":"text",
            "text":
                {
                    "content":formatted_message
                }

        })
    };

    function pushChatCallback (error, response, body) {
        console.log("log : " + body);
        if (!error && response.statusCode == 200) {
            bodyObject = JSON.parse(body);
            if (bodyObject.errmsg === "ok") {
                console.log("Message successfully delivered--" + formatted_message);
                return true;

            } else {
                console.log( " There was an error delivering the message: " + formatted_message
                    + "  statusCode: "+response.statusCode + " error :" + error);

                console.log( "@@@ 1 "  );

                return bodyObject.errcode;
            }
        }
    }
    request(pushChatOptions, pushChatCallback);
    return res;
}

function SendMessage(req, res, next)
{

    var openID;
    //wechat id로 open id 가져오기
    getOpenId(req, res, next );
    console.log( "RETURN_DATA.openId " + RETURN_DATA.openId );
    // //오픈아디,메세지로 전송하기
    // getToken(RETURN_DATA.openId, req.body.StartMessage);
    res.status(200).send('Send Message Sucess');
    // res.redirect('/');
    return true;
}

function getOpenId(req ,res,next  )
{
    getConnection(function (err, connection) {
        //위챗 아디로 open id 가져오기
        var query = 'SELECT * FROM TB_USER_INFO WHERE  USER_WECHAT_ID = ?  ORDER BY USER_SEQ DESC LIMIT 1';
        var id    =  req.body.wechatId;

        connection.query(query, id, function (err, rows) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("rows1 : " +  JSON.stringify(rows));
                var Array = JSON.parse(JSON.stringify(rows ));

                RETURN_DATA.openId    = Array[0]["USER_OPEN_ID"];
                console.log("Array USER_OPEN_ID ", Array[0]["USER_OPEN_ID"]  );
                // res.render('taxiAddressLandscape', { rows : rows });

                req.body.openId = Array[0]["USER_OPEN_ID"];
                //화면에서 주소 등록 인경우 처리

                if (req.body.message =='2') {
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

function RoadAddressInsert(req, res, next  )
{
    console.log(" Start!! RoadAddressInsert ");

    getConnection(function (err, connection) {
        if(JSON.stringify(req.body) == '{}') {
            res.status(404);
            res.json({
                "success" : 0,
                "message" : "Parameters missing"
            });
            return false;
        }
        //입력할 값 셋팅
        var road_info_set   =
            {
                'USER_WECHAT_ID'   : req.body.wechatId ,
                'START_NM_CN'      : req.body.StartCn,
                'START_NM_KR'      : req.body.StartKr,
                'END_NM_CN'        : req.body.EndCn,
                'END_NM_KR'        : req.body.EndKr
            };

        //insert 문장
        var query = 'INSERT INTO TB_ROAD_INFO SET  ?' ;

        connection.query(query, road_info_set , function (err, rows) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log(" INSERT SUCESS " );
                res.status(200).send('Insert Sucess');

                return true;
            }
            connection.release();
        });
    });

    return true;
}


function RoadAddressUpdate(req, res, next  )
{
    console.log(" Start!! RoadAddressUpdate ");

    getConnection(function (err, connection) {
        if(JSON.stringify(req.body) == '{}') {
            res.status(404);
            res.json({
                "success" : 0,
                "message" : "Parameters missing"
            });
            return false;
        }

        //입력할 값 셋팅 update입력값과 insert 입력값 포맷이 다름 {}, [] 괄호도 다름
        var road_info_set   =
            [
                req.body.EndCn,
                req.body.EndKr,
                req.body.LargeAddrCn,
                req.body.roadSeq ,
                req.body.wechatId
            ];

        //insert 문장
        var query = ' UPDATE TB_ROAD_INFO ' +
            ' SET  END_NM_CN      = ?, ' +
            'END_NM_KR       = ?, ' +
            'LARGE_ADDR_CN   = ?  ' +
            ' WHERE  ROAD_SEQ     = ?  ' +
            ' AND  USER_WECHAT_ID  = ?  ';


        connection.query(query, road_info_set , function (err, rows) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log(" UPDATE SUCESS " );
                res.status(200).send('UPDATE Sucess');

                return true;
            }
            connection.release();
        });
    });

    return true;
}


function SelectMaxSeq(req ,res,next  )
{

    getConnection(function (err, connection) {

        //위챗 아디로 max seq 가져오기
        var query = ' SELECT A.ROAD_SEQ   ' +
            'FROM  TB_ROAD_INFO  A ' +
            'WHERE A.USER_WECHAT_ID = ?         ' +
            'ORDER BY A.ROAD_SEQ   DESC        LIMIT 1';

        var id    =  req.body.wechatId;


        connection.query(query, id, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                console.log("rows1 : " +  JSON.stringify(rows));

                var Array = JSON.parse(JSON.stringify(rows ));

                req.body.roadSeq = Array[0]["ROAD_SEQ"];
                //화면에서 주소 등록 인경우 처리
                if (req.body.message =='1' )
                {
                    console.log(" Before!! RoadAddress Update ");
                    RoadAddressUpdate(req,res,next);
                }

            }

            connection.release();
        })
    })


    console.log("openID : " + RETURN_DATA.openId);
    return true;
}


module.exports = router;
