var express = require('express');
var config = require('../config/service_config');
var router = express.Router();

/* GET home page. */
router.get('/main', function(req, res, next) {
    res.render('papastampMain', {url:config.url});
});

router.get('/contact', function(req, res, next) {
    res.render('contact', {url:config.url});
});

router.get('/error', function(req, res, next) {
    res.render('error', {url:config.url});
});


//GET Food Shop List
router.get('/shopList', function (req, res, next) {
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
                            console.error("[ShopLIst Buy Insert] Select ShopLIst Count Error : ", err);
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


module.exports = router;
