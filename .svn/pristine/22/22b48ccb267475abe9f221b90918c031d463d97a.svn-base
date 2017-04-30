var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var config = require('../lib/config');
var api = require("../lib/api");
var request = require("request");
var cheerio = require("cheerio");
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

//GET Event List
router.get('/eventHome', function (req, res, next) {
    res.render('event/eventHome', {url:config.url});
});

//GET Event List
router.get('/eventList', function (req, res, next) {
    var lottoData;
    //event event
    getConnection(function (err, connection){
        // Select Event List
        var selectLottoQuery = 'select SEL.EVENT_IMAGE, SED.EVENT_WIN, SED.EVENT_WIN_SEQ, SED.EVENT_WIN_DATE, SED.EVENT_PRODUCT from ' +
            '(select * from (select * from SB_EVENT_DETAIL order by EVENT_WIN_DATE DESC) as SED group by SED.EVENT_ID) as SED ' +
            'inner join SB_EVENT_LIST as SEL on SED.EVENT_ID = SEL.EVENT_ID';
        connection.query(selectLottoQuery, function (err, row) {
            if (err) {
                console.error("@@@ [Event List] Select Event List Error : " + err);
                throw err;
            }else{
                console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                res.render('event/eventList', {lottoData :row[0], annualpensionData: row[1], starbucksData: row[2]});
            }
            connection.release();
        });
    });
});

//GET Event List
router.get('/eventMap', function (req, res, next) {
    res.render('event/eventMapList', {url:config.url});
});

//GET Event List
router.get('/starbucksLocation', function (req, res, next) {
    res.render('event/starbucksLocation');
});

// /GET Event Detail
router.get('/lottoLocation', function (req, res, next) {
    var lottoData;
    //event event
    getConnection(function (err, connection){
        // Select Event List
        var selectLottoQuery = 'select SEL.EVENT_IMAGE, SED.EVENT_WIN, SED.EVENT_WIN_SEQ, SED.EVENT_WIN_DATE, SED.EVENT_PRODUCT from ' +
            '(select * from (select * from SB_EVENT_DETAIL order by EVENT_WIN_DATE DESC) as SED group by SED.EVENT_ID) as SED ' +
            'inner join SB_EVENT_LIST as SEL on SED.EVENT_ID = SEL.EVENT_ID where SEL.EVENT_ID = "SB-EVENT-0001"';
        connection.query(selectLottoQuery, function (err, row) {
            if (err) {
                console.error("@@@ [Event List] Select Event List Error : " + err);
                throw err;
            }else{
                console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                res.render('event/lottoLocation', {url:config.url, lottoData :row[0]});
            }
            connection.release();
        });
    });
});

router.get('/lottoShopList', function (req, res, next) {
    var currentLat = req.query.current_lat;
    var currentLon = req.query.current_lon;

    //shop event
    getConnection(function (err, connection){
        var host = 'https://apis.daum.net/local/geo/coord2detailaddr?apikey=076df8cf69c376d5065c3bc99891a438&x='+currentLon+'&y='+currentLat+'&inputCoordSystem=WGS84';
        request.get({'url': host}, function (error, req, addrData) {
            if (!error) {
                parser.parseString(addrData, function(err, result) {
                    var addr = '';
                    var addrNew = result.address.new[0].name[0].$.value;
                    if(addrNew == "") {
                        addr = result.address.old[0].name[0].$.value;
                    }else {
                        addr = addrNew;
                    }

                    // var bigAddr = '강남';
                    var startLat = Number(currentLat) - 0.1;
                    var startLon = Number(currentLon) - 0.1;
                    var endLat = Number(currentLat) + 0.1;
                    var endLon = Number(currentLon) + 0.1;

                    // Select Event List
                    // var selectLottoShopQuery = 'select * from SB_EVENT_SHOP where SHOP_LAT between ? and ? and SHOP_LON between ? and ? and DEL_YN = "N" and DESCRIPTION like "' + bigAddr + '%" limit 20;';
                    var selectLottoShopQuery = 'select * from SB_EVENT_SHOP where SHOP_LAT between ? and ? and SHOP_LON between ? and ? and DEL_YN = "N" limit 10;';
                    connection.query(selectLottoShopQuery, [startLat, endLat, startLon, endLon], function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            // 현재 주소 가져오기
                            // console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                            res.send({shopData :row, address :addr});
                        }
                    });
                });
            }
        });
    });
});

// /GET Event Detail
router.get('/annualLocation', function (req, res, next) {
    var lottoData;
    //event event
    getConnection(function (err, connection){
        // Select Event List
        var selectLottoQuery = 'select SEL.EVENT_IMAGE, SED.EVENT_WIN, SED.EVENT_WIN_SEQ, SED.EVENT_WIN_DATE, SED.EVENT_PRODUCT from ' +
            '(select * from (select * from SB_EVENT_DETAIL order by EVENT_WIN_DATE DESC) as SED group by SED.EVENT_ID) as SED ' +
            'inner join SB_EVENT_LIST as SEL on SED.EVENT_ID = SEL.EVENT_ID where SEL.EVENT_ID = "SB-EVENT-0002"';
        connection.query(selectLottoQuery, function (err, row) {
            if (err) {
                console.error("@@@ [Event List] Select Event List Error : " + err);
                throw err;
            }else{
                console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                res.render('event/annualLocation', {url:config.url, annualpensionData: row[0]});
            }
            connection.release();
        });
    });
});

// /GET Event Detail
router.get('/getPreLottoData', function (req, res, next) {
    var lottoNum = req.query.lotto_num;
    var preLottoNum = Number(lottoNum) - 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select Event List
        var existstLottoQuery = 'select exists (select * from SB_EVENT_DETAIL where EVENT_ID="SB-EVENT-0001" and EVENT_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, preLottoNum, function (err, row) {
            if (err) {
                console.error("@@@ [Event List] Select Event List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.EVENT_IMAGE, SED.EVENT_WIN, SED.EVENT_WIN_SEQ, SED.EVENT_WIN_DATE, SED.EVENT_PRODUCT from ' +
                        '(select * from SB_EVENT_DETAIL order by EVENT_WIN_DATE DESC) as SED ' +
                        'inner join SB_EVENT_LIST as SEL on SED.EVENT_ID = SEL.EVENT_ID where SED.EVENT_ID="SB-EVENT-0001" and EVENT_WIN_SEQ=?';
                    connection.query(selectLottoQuery, preLottoNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                            res.send({lottoData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

// /GET Event Detail
router.get('/getPostLottoData', function (req, res, next) {
    var lottoNum = req.query.lotto_num;
    var postLottoNum = Number(lottoNum) + 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select Event List
        var existstLottoQuery = 'select exists (select * from SB_EVENT_DETAIL where EVENT_ID="SB-EVENT-0001" and EVENT_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, postLottoNum, function (err, row) {
            if (err) {
                console.error("@@@ [Event List] Select Event List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.EVENT_IMAGE, SED.EVENT_WIN, SED.EVENT_WIN_SEQ, SED.EVENT_WIN_DATE, SED.EVENT_PRODUCT from ' +
                        '(select * from SB_EVENT_DETAIL order by EVENT_WIN_DATE DESC) as SED ' +
                        'inner join SB_EVENT_LIST as SEL on SED.EVENT_ID = SEL.EVENT_ID where SED.EVENT_ID="SB-EVENT-0001" and EVENT_WIN_SEQ=?';
                    connection.query(selectLottoQuery, postLottoNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                            res.send({lottoData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

// /GET Event Detail
router.get('/getPreAnnualpensionData', function (req, res, next) {
    var annualpensionNum = req.query.annualpension_num;
    var preAnnualpensionNum = Number(annualpensionNum) - 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select Event List
        var existstLottoQuery = 'select exists (select * from SB_EVENT_DETAIL where EVENT_ID="SB-EVENT-0002" and EVENT_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, preAnnualpensionNum, function (err, row) {
            if (err) {
                console.error("@@@ [Event List] Select Event List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.EVENT_IMAGE, SED.EVENT_WIN, SED.EVENT_WIN_SEQ, SED.EVENT_WIN_DATE, SED.EVENT_PRODUCT from ' +
                        '(select * from SB_EVENT_DETAIL order by EVENT_WIN_DATE DESC) as SED ' +
                        'inner join SB_EVENT_LIST as SEL on SED.EVENT_ID = SEL.EVENT_ID where SED.EVENT_ID="SB-EVENT-0002" and EVENT_WIN_SEQ=?';
                    connection.query(selectLottoQuery, preAnnualpensionNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                            res.send({annualpensionData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

// /GET Event Detail
router.get('/getPostAnnualpensionData', function (req, res, next) {
    var annualpensionNum = req.query.annualpension_num;
    var postAnnualpensionNum = Number(annualpensionNum) + 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select Event List
        var existstLottoQuery = 'select exists (select * from SB_EVENT_DETAIL where EVENT_ID="SB-EVENT-0002" and EVENT_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, postAnnualpensionNum, function (err, row) {
            if (err) {
                console.error("@@@ [Event List] Select Event List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.EVENT_IMAGE, SED.EVENT_WIN, SED.EVENT_WIN_SEQ, SED.EVENT_WIN_DATE, SED.EVENT_PRODUCT from ' +
                        '(select * from SB_EVENT_DETAIL order by EVENT_WIN_DATE DESC) as SED ' +
                        'inner join SB_EVENT_LIST as SEL on SED.EVENT_ID = SEL.EVENT_ID where SED.EVENT_ID="SB-EVENT-0002" and EVENT_WIN_SEQ=?';
                    connection.query(selectLottoQuery, postAnnualpensionNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                            res.send({annualpensionData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [Event List] Select Event List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

router.get('/eventList/keyboard', function (req, res, next) {
    const menu = {
        type: 'buttons',
        buttons: ["나눔로또 6/45", "연금복권 520", "현재 위치 판매점"]
    };

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify(menu));
});

router.post('/eventList/message', function (req, res, next) {
    const _obj = {
        user_key: req.body.user_key,
        type: req.body.type,
        content: req.body.content
    };

    var btn = req.body.content;

    if(btn == '나눔로또 6/45') {
        var message =
            {
                "message": {
                    "text": "나눔로또 6/45",
                    "photo": {
                        "url": "https://s3-ap-northeast-1.amazonaws.com/sbevent/image/lotto/lotto645.png",
                        "width": 540,
                        "height": 480
                    },
                    "message_button": {
                        "label": "로또복권 당첨 번호 확인",
                        "url": "https://whereareevent.com/event/lottoLocation"
                    }
                },
                "keyboard": {
                    "type": "buttons",
                    "buttons": [
                        "나눔로또 6/45",
                        "연금복권 520",
                        "현재 위치 판매점",
                    ]
                }
            }
    }else if(btn == '연금복권 520') {
        var message =
            {
                "message": {
                    "text": "연금복권 520",
                    "photo": {
                        "url": "https://s3-ap-northeast-1.amazonaws.com/sbevent/image/annualpension/annualpension520.png",
                        "width": 640,
                        "height": 480
                    },
                    "message_button": {
                        "label": "연금복권 당첨 번호 확인.",
                        "url": "https://whereareevent.com/event/annualLocation"
                    }
                },
                "keyboard": {
                    "type": "buttons",
                    "buttons": [
                        "나눔로또 6/45",
                        "연금복권 520",
                        "현재 위치 판매점",
                    ]
                }
            }
    }else {
        var message =
            {
                "message": {
                    "text": "현재 위치 판매점",
                    "photo": {
                        "url": "https://s3-ap-northeast-1.amazonaws.com/sbevent/image/vendi_main.png",
                        "width": 640,
                        "height": 480
                    },
                    "message_button": {
                        "label": "주위 판매점 위치 확인",
                        "url": "https://whereareevent.com/event/eventMap"
                    }
                },
                "keyboard": {
                    "type": "buttons",
                    "buttons": [
                        "나눔로또 6/45",
                        "연금복권 520",
                        "현재 위치 판매점",
                    ]
                }
            }
    }

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify(message));
});

router.post('/eventList/friend', function (req, res) {
    const user_key = req.body.user_key;
//    console.log(`${user_key}님이 쳇팅방에 참가했습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});

router.delete('/eventList/friend', function (req, res) {
    const user_key = req.body.user_key;
//    console.log(`${user_key}님이 쳇팅방을 차단했습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});

router.delete('/eventList/chat_room/:user_key', function (req, res) {
    const user_key = req.params.user_key;
//    console.log(`${user_key}님이 쳇팅방에서 나갔습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});

// /GET Event Detail
router.get('/kakao', function (req, res, next) {
    lottoDataInsert();
    res.render('event/kakao');
});





//GET Event List
router.get('/insertData1', function (req, res, next) {
    lottoDataInsert();
});


//GET Event List
router.get('/insertData2', function (req, res, next) {
    annualpensionDataInsert();
});


//GET Event List
router.get('/insertData3', function (req, res, next) {
    // var host = 'https://apis.daum.net/local/geo/coord2detailaddr?apikey=076df8cf69c376d5065c3bc99891a438&x=126.570667&y=33.450701&inputCoordSystem=WGS84';
    var host = 'https://apis.daum.net/local/geo/addr2coord?apikey=076df8cf69c376d5065c3bc99891a438&q=제주 특별자치도 제주시 첨단로 242&output=json';

    request.get({'url': host}, function (error, req, endBody) {
        if (!error) {
            if (endBody.status == 1) {
                console.log(error);
                res.send({error: 'arrive'});
            } else {
                console.log(endBody);
                res.send('');
            }
        }
    });
});

//GET Event List
router.get('/guideLoad', function (req, res, next) {
    var host = 'https://apis.daum.net/local/geo/addr2coord?apikey=076df8cf69c376d5065c3bc99891a438&q=제주 특별자치도 제주시 첨단로 242&output=json';

    request.get({'url': host}, function (error, req, endBody) {
        if (!error) {
             if (endBody.status == 1) {
                console.log(error);
                res.send({error: 'arrive'});
            } else {
                res.send('');
            }
        }
    });
});

//lotto event insert
function lottoDataInsert () {
    request({
            url : 'http://www.nlotto.co.kr/common.do?method=getLottoNumber',
            method:'GET'
        },function (error, response, body) {
            if(!error && response.statusCode == 200){
                console.log("### [Event List] Exists Lotto Data Success ### ");
                var lottoData = JSON.parse(body);
                getConnection(function (err, connection){
                    var dataCheck ='';
                    var winSequence = lottoData.drwNo;
                    var winData = lottoData.drwtNo1 + "#%&" + lottoData.drwtNo2 + "#%&" + lottoData.drwtNo3 + "#%&" + lottoData.drwtNo4 + "#%&" + lottoData.drwtNo5 + "#%&" + lottoData.drwtNo6 + "#%&" + lottoData.bnusNo;
                    var winDate = lottoData.drwNoDate;
                    var winProduct = lottoData.firstWinamnt;
                    // Exist Lotto Data
                    var existsQuery = 'select exists (select * from SB_EVENT_DETAIL where EVENT_ID="SB-EVENT-0001" and EVENT_WIN_SEQ = "' + winSequence + '") as DATA_CHECK';
                    connection.query(existsQuery, function (err, row) {
                        if (err) {
                            console.error("@@@ [Event Detail] Exists Event Detail Error : " + err);
                            throw err;
                        }else{
                            dataCheck = row[0].DATA_CHECK;
                            if(dataCheck == 0) {
                                // Insert Buy List
                                var insertQuery = 'insert into SB_EVENT_DETAIL (EVENT_ID, EVENT_WIN, EVENT_WIN_SEQ, EVENT_WIN_DATE, EVENT_PRODUCT, DESCRIPTION) values ("SB-EVENT-0001"' + ', ?' + ', "' + winSequence + '", "' + winDate + '", "' + winProduct + '", "1등 당첨 정보") on DUPLICATE KEY update EVENT_WIN = "' + winData + '"';
                                console.log(insertQuery);
                                connection.query(insertQuery, winData, function (err, row) {
                                    if (err) {
                                        console.error("[Event Detail] Insert Event Detail Error : ", err);
                                        api.error(res);
                                    } else {
                                        console.log("### [Event Detail Insert] Insert Event Detail Data Success ### " + JSON.stringify(row));
                                    }
                                });
                            }else{
                                console.log("### [Event Detail] Insert Event Detail Success ### ");}
                        }
                        connection.release();
                    });
                });
            }
        }
    );
}

//annualpension event insert
function annualpensionDataInsert () {
    //request pension event
    var annualpensionSeq='';
    var annualpensionDate='';
    var annualpensionWin1='';
    var annualpensionWin2='';
    var url = "http://www.nlotto.co.kr/gameResult.do?method=win520";
    request(url, function(error, response, body) {
        if (error) {
            console.error("*** [Annualpension Data] Error : " + err);
            throw err;
        } else {
            console.log("### [Event List] Exists Lotto Data Success ### ");
            var $ = cheerio.load(body);
            var seqDateElements = $("div.win520no1_wrap h3");
            var splitElements = seqDateElements.text().split(' ');
            annualpensionSeq = splitElements[0];
            annualpensionDate = splitElements[1].replace(/[^0-9]/g,'') + '-' +  splitElements[2].replace(/[^0-9]/g,'') + '-' + splitElements[3].replace(/[^0-9]/g,'');
            var win1Elements = $("div.no1_num_wrap ul.no1_1");

            win1Elements.each(function() {
                annualpensionWin1 += $(this).find("li").text();
                annualpensionWin1 = annualpensionWin1.replace(/[^0-9]/g,'');
            });
            var win2Elements = $("div.no1_num_wrap ul.no1_2");

            win2Elements.each(function() {
                annualpensionWin2 += $(this).find("li").text();
                annualpensionWin2 = annualpensionWin2.replace(/[^0-9]/g,'');
            });
            getConnection(function (err, connection){
                var dataCheck ='';
                // Exist annualpension Data
                var existsQuery = 'select exists (select * from SB_EVENT_DETAIL where EVENT_ID="SB-EVENT-0002" and EVENT_WIN_SEQ = "' + annualpensionWin1+'#%&'+annualpensionWin2 + '") as DATA_CHECK';
                connection.query(existsQuery, function (err, row) {
                    if (err) {
                        console.error("@@@ [Event Detail] Exists Event Detail Error : " + err);
                        throw err;
                    }else{
                        dataCheck = row[0].DATA_CHECK;
                        if(dataCheck == 0) {
                            // Insert Buy List
                            var insertQuery = 'insert into SB_EVENT_DETAIL (EVENT_ID, EVENT_WIN, EVENT_WIN_SEQ, EVENT_WIN_DATE, EVENT_PRODUCT, DESCRIPTION) values ("SB-EVENT-0002"' + ', ?' + ', "' + annualpensionSeq + '", "' + annualpensionDate + '", "월 500만원 * 20년", "1등 당첨 정보") on DUPLICATE KEY update EVENT_WIN = "' + annualpensionWin1+'#%&'+annualpensionWin2 + '"';
                            console.log(insertQuery);
                            connection.query(insertQuery, annualpensionWin1+'$^*'+annualpensionWin2, function (err, row) {
                                if (err) {
                                    console.error("[Event Detail] Insert Event Detail Error : ", err);
                                    api.error(res);
                                } else {
                                    console.log("### [Event Detail Insert] Insert Event Detail Data Success ### " + JSON.stringify(row));
                                }
                            });
                        }else{
                            console.log("### [Event Detail] Insert Event Detail Success ### ");}
                    }
                    connection.release();
                });
            });
        }
    });
}

module.exports = router;
