var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var config = require('../lib/config');
var request = require("request");
var cheerio = require("cheerio");
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var redis   = require('redis');
var publisherClient = redis.createClient();

//GET Food Shop Init
router.get('/foodShop', function (req, res, next) {
    var id = req.query.id;

    getConnection(function (err, connection){
        // Select food Menu
        var selectShopQuery = 'select SSI.* from SB_SHOP_INFO as SSI where SSI.SHOP_ID = ?';
        connection.query(selectShopQuery, id, function (err, shop) {
            if (err) {
                console.error("@@@ [shop info] Select shop info Error : " + err);
                throw err;
            }else{
                console.log("### [shop info] Select shop info Success ### " + JSON.stringify(shop));
                var selectMenuQuery = 'select SSM.* from SB_SHOP_MENU as SSM where SSM.SHOP_ID = ?';
                connection.query(selectMenuQuery, id, function (err, menu) {
                    if (err) {
                        console.error("@@@ [food Menu] Select food Menu Error : " + err);
                        throw err;
                    }else{
                        console.log("### [food Menu] Select food Menu Success ### " + JSON.stringify(menu));
                        res.render('foods/foodShop', {url:config.url, shopData:shop[0], foodData:menu, pushShopId:id});
                    }
                });
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

router.get('/update-stream/:shopping_id', function(req, res) {
    // let request last as long as possible
    req.socket.setTimeout(Number.MAX_VALUE);

    var shoppingData = req.params.shopping_id;
    // console.log('x ', req.params.shopping_id);

    var messageCount = 0;
    var subscriber = redis.createClient();

    subscriber.subscribe(shoppingData);

    // In case we encounter an error...print it out to the console
    subscriber.on("error", function(err) {
        console.log("Redis Error: " + err);
    });

    // When we receive a message from the redis connection
    subscriber.on("message", function(channel, message) {
        console.log('XX : ', message);
        messageCount++; // Increment our message count

        res.write('id: ' + messageCount + '\n');
        res.write("data: " + message + '\n\n'); // Note the extra newline
    });

    //send headers for event-stream connection
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    // The 'close' event is fired when a user closes their browser window.
    // In that situation we want to make sure our redis channel subscription
    // is properly shut down to prevent memory leaks...and incorrect subscriber
    // counts to the channel.
    req.on("close", function() {
        subscriber.unsubscribe();
        subscriber.quit();
    });
});

router.get('/fire-event/:shopping_id/:event_name', function(req, res) {
    // console.log('GGGGGGGGGGGGGG', req.params.shopping_id);
    var shoppingData = req.params.shopping_id;
    publisherClient.publish( shoppingData, ('"' + req.params.event_name + '" page visited') );
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('All clients have received "' + req.params.event_name + '"');
    res.end();
});

module.exports = router;

