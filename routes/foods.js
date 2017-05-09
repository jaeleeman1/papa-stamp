var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var config = require('../lib/config');
var request = require("request");
var cheerio = require("cheerio");
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

//GET Food Shop Init
router.get('/foodShop', function (req, res, next) {
    var id = req.query.id;

    getConnection(function (err, connection){
        // Select food Menu
        var selectFoodQuery = 'select SSM.*, SSI.SHOP_NAME from SB_SHOP_MENU as SSM ' +
            'inner join SB_SHOP_INFO as SSI on SSM.SHOP_ID = SSI.SHOP_ID where SSI.SHOP_ID = ?';
        connection.query(selectFoodQuery, id, function (err, row) {
            if (err) {
                console.error("@@@ [food Menu] Select food Menu Error : " + err);
                throw err;
            }else{
                console.log("### [food Menu] Select food Menu Success ### " + JSON.stringify(row));
                res.render('foods/foodShop', {url:config.url, foodData :row});
            }
            connection.release();
        });
    });
});

//GET Food Shop List
router.get('/foodShopList', function (req, res, next) {
    var currentLat = req.query.current_lat;
    var currentLon = req.query.current_lon;

    //Shop List API
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
                    var selectLottoShopQuery = 'select * from SB_SHOP_INFO where DEL_YN = "N" limit 10;';
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




//GET foods List
router.get('/foodsHome', function (req, res, next) {
    res.render('foods/foodsHome', {url:config.url});
});

//GET foods List
router.get('/foodsList', function (req, res, next) {
    var lottoData;
    //foods foods
    getConnection(function (err, connection){
        // Select foods List
        var selectLottoQuery = 'select SEL.foods_IMAGE, SED.foods_WIN, SED.foods_WIN_SEQ, SED.foods_WIN_DATE, SED.foods_PRODUCT from ' +
            '(select * from (select * from SB_foods_DETAIL order by foods_WIN_DATE DESC) as SED group by SED.foods_ID) as SED ' +
            'inner join SB_foods_LIST as SEL on SED.foods_ID = SEL.foods_ID';
        connection.query(selectLottoQuery, function (err, row) {
            if (err) {
                console.error("@@@ [foods List] Select foods List Error : " + err);
                throw err;
            }else{
                console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                res.render('foods/foodsList', {lottoData :row[0], annualpensionData: row[1], starbucksData: row[2]});
            }
            connection.release();
        });
    });
});

//GET foods List
router.get('/starbucksLocation', function (req, res, next) {
    res.render('foods/starbucksLocation');
});

// /GET foods Detail
router.get('/lottoLocation', function (req, res, next) {
    var lottoData;
    //foods foods
    getConnection(function (err, connection){
        // Select foods List
        var selectLottoQuery = 'select SEL.foods_IMAGE, SED.foods_WIN, SED.foods_WIN_SEQ, SED.foods_WIN_DATE, SED.foods_PRODUCT from ' +
            '(select * from (select * from SB_foods_DETAIL order by foods_WIN_DATE DESC) as SED group by SED.foods_ID) as SED ' +
            'inner join SB_foods_LIST as SEL on SED.foods_ID = SEL.foods_ID where SEL.foods_ID = "SB-foods-0001"';
        connection.query(selectLottoQuery, function (err, row) {
            if (err) {
                console.error("@@@ [foods List] Select foods List Error : " + err);
                throw err;
            }else{
                console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                res.render('foods/lottoLocation', {url:config.url, lottoData :row[0]});
            }
            connection.release();
        });
    });
});

router.get('/lottoShopList', function (req, res, next) {
    var currentLat = req.query.current_lat;
    var currentLon = req.query.current_lon;

    //shop foods
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

                    // Select foods List
                    // var selectLottoShopQuery = 'select * from SB_foods_SHOP where SHOP_LAT between ? and ? and SHOP_LON between ? and ? and DEL_YN = "N" and DESCRIPTION like "' + bigAddr + '%" limit 20;';
                    var selectLottoShopQuery = 'select * from SB_foods_SHOP where SHOP_LAT between ? and ? and SHOP_LON between ? and ? and DEL_YN = "N" limit 10;';
                    connection.query(selectLottoShopQuery, [startLat, endLat, startLon, endLon], function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            // 현재 주소 가져오기
                            // console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                            res.send({shopData :row, address :addr});
                        }
                    });
                });
            }
        });
    });
});

// /GET foods Detail
router.get('/annualLocation', function (req, res, next) {
    var lottoData;
    //foods foods
    getConnection(function (err, connection){
        // Select foods List
        var selectLottoQuery = 'select SEL.foods_IMAGE, SED.foods_WIN, SED.foods_WIN_SEQ, SED.foods_WIN_DATE, SED.foods_PRODUCT from ' +
            '(select * from (select * from SB_foods_DETAIL order by foods_WIN_DATE DESC) as SED group by SED.foods_ID) as SED ' +
            'inner join SB_foods_LIST as SEL on SED.foods_ID = SEL.foods_ID where SEL.foods_ID = "SB-foods-0002"';
        connection.query(selectLottoQuery, function (err, row) {
            if (err) {
                console.error("@@@ [foods List] Select foods List Error : " + err);
                throw err;
            }else{
                console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                res.render('foods/annualLocation', {url:config.url, annualpensionData: row[0]});
            }
            connection.release();
        });
    });
});

// /GET foods Detail
router.get('/getPreLottoData', function (req, res, next) {
    var lottoNum = req.query.lotto_num;
    var preLottoNum = Number(lottoNum) - 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select foods List
        var existstLottoQuery = 'select exists (select * from SB_foods_DETAIL where foods_ID="SB-foods-0001" and foods_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, preLottoNum, function (err, row) {
            if (err) {
                console.error("@@@ [foods List] Select foods List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.foods_IMAGE, SED.foods_WIN, SED.foods_WIN_SEQ, SED.foods_WIN_DATE, SED.foods_PRODUCT from ' +
                        '(select * from SB_foods_DETAIL order by foods_WIN_DATE DESC) as SED ' +
                        'inner join SB_foods_LIST as SEL on SED.foods_ID = SEL.foods_ID where SED.foods_ID="SB-foods-0001" and foods_WIN_SEQ=?';
                    connection.query(selectLottoQuery, preLottoNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                            res.send({lottoData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

// /GET foods Detail
router.get('/getPostLottoData', function (req, res, next) {
    var lottoNum = req.query.lotto_num;
    var postLottoNum = Number(lottoNum) + 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select foods List
        var existstLottoQuery = 'select exists (select * from SB_foods_DETAIL where foods_ID="SB-foods-0001" and foods_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, postLottoNum, function (err, row) {
            if (err) {
                console.error("@@@ [foods List] Select foods List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.foods_IMAGE, SED.foods_WIN, SED.foods_WIN_SEQ, SED.foods_WIN_DATE, SED.foods_PRODUCT from ' +
                        '(select * from SB_foods_DETAIL order by foods_WIN_DATE DESC) as SED ' +
                        'inner join SB_foods_LIST as SEL on SED.foods_ID = SEL.foods_ID where SED.foods_ID="SB-foods-0001" and foods_WIN_SEQ=?';
                    connection.query(selectLottoQuery, postLottoNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                            res.send({lottoData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

// /GET foods Detail
router.get('/getPreAnnualpensionData', function (req, res, next) {
    var annualpensionNum = req.query.annualpension_num;
    var preAnnualpensionNum = Number(annualpensionNum) - 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select foods List
        var existstLottoQuery = 'select exists (select * from SB_foods_DETAIL where foods_ID="SB-foods-0002" and foods_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, preAnnualpensionNum, function (err, row) {
            if (err) {
                console.error("@@@ [foods List] Select foods List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.foods_IMAGE, SED.foods_WIN, SED.foods_WIN_SEQ, SED.foods_WIN_DATE, SED.foods_PRODUCT from ' +
                        '(select * from SB_foods_DETAIL order by foods_WIN_DATE DESC) as SED ' +
                        'inner join SB_foods_LIST as SEL on SED.foods_ID = SEL.foods_ID where SED.foods_ID="SB-foods-0002" and foods_WIN_SEQ=?';
                    connection.query(selectLottoQuery, preAnnualpensionNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                            res.send({annualpensionData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

// /GET foods Detail
router.get('/getPostAnnualpensionData', function (req, res, next) {
    var annualpensionNum = req.query.annualpension_num;
    var postAnnualpensionNum = Number(annualpensionNum) + 1;
    var dataCheck = '';

    getConnection(function (err, connection){
        // Select foods List
        var existstLottoQuery = 'select exists (select * from SB_foods_DETAIL where foods_ID="SB-foods-0002" and foods_WIN_SEQ=?) as DATA_CHECK';
        connection.query(existstLottoQuery, postAnnualpensionNum, function (err, row) {
            if (err) {
                console.error("@@@ [foods List] Select foods List Error : " + err);
                throw err;
            }else{
                dataCheck = row[0].DATA_CHECK;
                if(dataCheck == 1) {
                    var selectLottoQuery = 'select SEL.foods_IMAGE, SED.foods_WIN, SED.foods_WIN_SEQ, SED.foods_WIN_DATE, SED.foods_PRODUCT from ' +
                        '(select * from SB_foods_DETAIL order by foods_WIN_DATE DESC) as SED ' +
                        'inner join SB_foods_LIST as SEL on SED.foods_ID = SEL.foods_ID where SED.foods_ID="SB-foods-0002" and foods_WIN_SEQ=?';
                    connection.query(selectLottoQuery, postAnnualpensionNum, function (err, row) {
                        if (err) {
                            console.error("[Shopping Buy Insert] Select Shopping Count Error : ", err);
                            api.error(res);
                        } else {
                            console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                            res.send({annualpensionData :row[0], dataCheck:dataCheck});
                        }
                    });
                }else {
                    console.log("### [foods List] Select foods List Success ### " + JSON.stringify(row));
                    res.send({dataCheck:dataCheck});
                }
            }
            connection.release();
        });
    });
});

router.get('/foodsList/keyboard', function (req, res, next) {
    const menu = {
        type: 'buttons',
        buttons: ["나눔로또 6/45", "연금복권 520", "현재 위치 판매점"]
    };

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify(menu));
});

router.post('/foodsList/message', function (req, res, next) {
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
                        "url": "https://s3-ap-northeast-1.amazonaws.com/sbfoods/image/lotto/lotto645.png",
                        "width": 540,
                        "height": 480
                    },
                    "message_button": {
                        "label": "로또복권 당첨 번호 확인",
                        "url": "https://wherearefoods.com/foods/lottoLocation"
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
                        "url": "https://s3-ap-northeast-1.amazonaws.com/sbfoods/image/annualpension/annualpension520.png",
                        "width": 640,
                        "height": 480
                    },
                    "message_button": {
                        "label": "연금복권 당첨 번호 확인.",
                        "url": "https://wherearefoods.com/foods/annualLocation"
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
                        "url": "https://s3-ap-northeast-1.amazonaws.com/sbfoods/image/vendi_main.png",
                        "width": 640,
                        "height": 480
                    },
                    "message_button": {
                        "label": "주위 판매점 위치 확인",
                        "url": "https://wherearefoods.com/foods/foodsMap"
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

router.post('/foodsList/friend', function (req, res) {
    const user_key = req.body.user_key;
//    console.log(`${user_key}님이 쳇팅방에 참가했습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});

router.delete('/foodsList/friend', function (req, res) {
    const user_key = req.body.user_key;
//    console.log(`${user_key}님이 쳇팅방을 차단했습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});

router.delete('/foodsList/chat_room/:user_key', function (req, res) {
    const user_key = req.params.user_key;
//    console.log(`${user_key}님이 쳇팅방에서 나갔습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});

// /GET foods Detail
router.get('/kakao', function (req, res, next) {
    lottoDataInsert();
    res.render('foods/kakao');
});





//GET foods List
router.get('/insertData1', function (req, res, next) {
    lottoDataInsert();
});


//GET foods List
router.get('/insertData2', function (req, res, next) {
    annualpensionDataInsert();
});


//GET foods List
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

//GET foods List
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

//lotto foods insert
function lottoDataInsert () {
    request({
            url : 'http://www.nlotto.co.kr/common.do?method=getLottoNumber',
            method:'GET'
        },function (error, response, body) {
            if(!error && response.statusCode == 200){
                console.log("### [foods List] Exists Lotto Data Success ### ");
                var lottoData = JSON.parse(body);
                getConnection(function (err, connection){
                    var dataCheck ='';
                    var winSequence = lottoData.drwNo;
                    var winData = lottoData.drwtNo1 + "#%&" + lottoData.drwtNo2 + "#%&" + lottoData.drwtNo3 + "#%&" + lottoData.drwtNo4 + "#%&" + lottoData.drwtNo5 + "#%&" + lottoData.drwtNo6 + "#%&" + lottoData.bnusNo;
                    var winDate = lottoData.drwNoDate;
                    var winProduct = lottoData.firstWinamnt;
                    // Exist Lotto Data
                    var existsQuery = 'select exists (select * from SB_foods_DETAIL where foods_ID="SB-foods-0001" and foods_WIN_SEQ = "' + winSequence + '") as DATA_CHECK';
                    connection.query(existsQuery, function (err, row) {
                        if (err) {
                            console.error("@@@ [foods Detail] Exists foods Detail Error : " + err);
                            throw err;
                        }else{
                            dataCheck = row[0].DATA_CHECK;
                            if(dataCheck == 0) {
                                // Insert Buy List
                                var insertQuery = 'insert into SB_foods_DETAIL (foods_ID, foods_WIN, foods_WIN_SEQ, foods_WIN_DATE, foods_PRODUCT, DESCRIPTION) values ("SB-foods-0001"' + ', ?' + ', "' + winSequence + '", "' + winDate + '", "' + winProduct + '", "1등 당첨 정보") on DUPLICATE KEY update foods_WIN = "' + winData + '"';
                                console.log(insertQuery);
                                connection.query(insertQuery, winData, function (err, row) {
                                    if (err) {
                                        console.error("[foods Detail] Insert foods Detail Error : ", err);
                                        api.error(res);
                                    } else {
                                        console.log("### [foods Detail Insert] Insert foods Detail Data Success ### " + JSON.stringify(row));
                                    }
                                });
                            }else{
                                console.log("### [foods Detail] Insert foods Detail Success ### ");}
                        }
                        connection.release();
                    });
                });
            }
        }
    );
}

//annualpension foods insert
function annualpensionDataInsert () {
    //request pension foods
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
            console.log("### [foods List] Exists Lotto Data Success ### ");
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
                var existsQuery = 'select exists (select * from SB_foods_DETAIL where foods_ID="SB-foods-0002" and foods_WIN_SEQ = "' + annualpensionWin1+'#%&'+annualpensionWin2 + '") as DATA_CHECK';
                connection.query(existsQuery, function (err, row) {
                    if (err) {
                        console.error("@@@ [foods Detail] Exists foods Detail Error : " + err);
                        throw err;
                    }else{
                        dataCheck = row[0].DATA_CHECK;
                        if(dataCheck == 0) {
                            // Insert Buy List
                            var insertQuery = 'insert into SB_foods_DETAIL (foods_ID, foods_WIN, foods_WIN_SEQ, foods_WIN_DATE, foods_PRODUCT, DESCRIPTION) values ("SB-foods-0002"' + ', ?' + ', "' + annualpensionSeq + '", "' + annualpensionDate + '", "월 500만원 * 20년", "1등 당첨 정보") on DUPLICATE KEY update foods_WIN = "' + annualpensionWin1+'#%&'+annualpensionWin2 + '"';
                            console.log(insertQuery);
                            connection.query(insertQuery, annualpensionWin1+'$^*'+annualpensionWin2, function (err, row) {
                                if (err) {
                                    console.error("[foods Detail] Insert foods Detail Error : ", err);
                                    api.error(res);
                                } else {
                                    console.log("### [foods Detail Insert] Insert foods Detail Data Success ### " + JSON.stringify(row));
                                }
                            });
                        }else{
                            console.log("### [foods Detail] Insert foods Detail Success ### ");}
                    }
                    connection.release();
                });
            });
        }
    });
}

module.exports = router;

