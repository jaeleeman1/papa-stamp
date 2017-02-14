/**
 * Created by yunchae.na on 2017-01-09.
 */
var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var request = require('request');
var xml2js = require('xml2js');

//GET foodShopMap Basic rendering
router.get('/', function (req, res, next) {
    var nickName = req.query.nickName;
      res.render('foodShopList', {nickName:nickName});
});

//POST get my current location
router.post('/currentLocation', function (req, res, next) {
    var ak = 'HzG9TZi2bzeiGmAPQyV0eAPYzea02TbU';
    var host = 'Http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&location=' + req.body.lat +',' + req.body.lng + '&output=xml&pois=1&ak=HzG9TZi2bzeiGmAPQyV0eAPYzea02TbU';
    request.get({'url': host}, function(error, request, body) {
        if (!error) {
            var parser = new xml2js.Parser();

            parser.parseString(body, function(err, data) {
                var address = data.GeocoderSearchResponse.result[0].formatted_address[0];

                console.log('currentLocation : ', address);
                res.send({address:address});
            });
        }
    });
})

//POST foodShopList
router.post('/shopList', function (req, res, next) {
            getConnection(function (err, connection){

                var address = req.body.address;
                var lat = req.body.lat;
                var lng = req.body.lng;

                if(address == null || address == undefined){
                    address = '';
                }
                if(lat == null || lat == undefined){
                    lat = '';
                }
                if(lng == null || lng == undefined){
                    lng = '';
                }

                var northEastLat = req.body.neLat;
                var northEastLng = req.body.neLng;
                var southWestLat = req.body.swLat;
                var southWestLng = req.body.swLng;

                var query =   'select ? as ADDRESS, ? as LAT, ? as LNG, FOOD_ID, FOOD_NAME_CN, FOOD_NAME_KR, FOOD_TYPE_KR, FOOD_SCOPE, CAPITA_PRICE, LONGITUDE_WALK, LATITUDE_WALK ' +
                                'from TB_FOOD_SHOP_LIST where LATITUDE_WALK between ? and ? and LONGITUDE_WALK between ? and ?';
                
                connection.query(query, [address, lat, lng, southWestLat, northEastLat, southWestLng, northEastLng], function (err, row) {
                    if (err) {
                        console.error("err : " + err);
                        throw err;
                    }else{
                        res.send({data:row});
                    }
                    connection.release();
                })
            });
});


//GET foodShop detail Information
router.get('/shopInfo', function (req, res, next) {
    getConnection(function (err, connection) {
        var query =  'select ? as ADDRESS, ? as LAT, ? as LNG, A.FOOD_ID, A.FOOD_NAME_CN, A.FOOD_NAME_KR, A.FOOD_TYPE_KR, A.CAPITA_PRICE, A.FOOD_SCOPE, A.BSNSS_TIME, B.FOOD_DIV,' +
                     'B.FOOD_MENU_CN, B.FOOD_MENU_KR, A.FOOD_ADDR_CN, A.TAXI_ADDR_CN, A.PHONE_NUM, A.DESCRIPTION from TB_FOOD_SHOP_LIST A, TB_FOOD_MENU B ' +
                     'where A.FOOD_ID = B.FOOD_ID and A.FOOD_ID = ?';
        var id = req.query.id; // foodList Id
        var address = req.query.address; // foodList Id
        var lat = req.query.lat; // foodList Id
        var lng = req.query.lng; // foodList Id
        var nickName = req.query.nickName;

        connection.query(query, [address, lat, lng, id], function (err, rows) {
            if (err) {
              //  console.error("err : " + err);
                throw err;
            }else{
               // console.log("rows : " + JSON.stringify(rows));

                if(rows.length > 0){
                    res.render('foodShopInfo', {rows : rows, length:rows.length, nickName:nickName});
                }else{
                    res.render('foodShopList');
                }
            }
            connection.release();
        })
    })
});

router.get('/transport', function (req, res, next) {
    getConnection(function (err, connection) {
        var query = 'select ? as ADDRESS, ? as LAT, ? as LNG, FOOD_ID, FOOD_NAME_CN, FOOD_NAME_KR, FOOD_ADDR_CN, TAXI_ADDR_CN, LONGITUDE_WALK, LATITUDE_WALK, LONGITUDE_TAXI, LATITUDE_TAXI from TB_FOOD_SHOP_LIST where FOOD_ID = ?';
        var id = req.query.id; // foodList Id
        var type = req.query.type;
        var address = req.query.address;
        var lat = req.query.lat;
        var lng = req.query.lng;
        var nickName = req.query.nickName;

        if(address == null || address == undefined){
            address = '';
        }
        if(lat == null || lat == undefined){
            lat = '';
        }
        if(lng == null || lng == undefined){
            lng = '';
        }

        connection.query(query, [address, lat, lng, id], function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                if(rows.length > 0){

                    var depart = {};
                    // depart.nameCn = '鹿港小镇';
                    // depart.nameKr = '벨라지오 Bellagio';
                    depart.addrWalking = rows[0].ADDRESS;
                    depart.addrTaxi = rows[0].ADDRESS;
                    depart.walkingLong = rows[0].LNG;
                    depart.walkingLat = rows[0].LAT;
                    depart.drivingLong = rows[0].LNG;
                    depart.drivingLat = rows[0].LAT;

                    var arrive = {};
                    arrive.id = rows[0].FOOD_ID;
                    arrive.nameCn = rows[0].FOOD_NAME_CN;
                    arrive.nameKr = rows[0].FOOD_NAME_KR ;
                    arrive.addrWalking = rows[0].FOOD_ADDR_CN ;
                    arrive.addrTaxi = rows[0].TAXI_ADDR_CN ;
                    arrive.walkingLong = rows[0].LONGITUDE_WALK;
                    arrive.walkingLat = rows[0].LATITUDE_WALK;
                    arrive.drivingLong = rows[0].LONGITUDE_TAXI;
                    arrive.drivingLat = rows[0].LATITUDE_TAXI;

                    var ak = 'HzG9TZi2bzeiGmAPQyV0eAPYzea02TbU';
                    var host = '';

                    if(type == 'walking'){
                        host = 'http://api.map.baidu.com/routematrix/v2/walking?output=json&origins='
                            + depart.walkingLat +','+ depart.walkingLong + '&destinations='+ arrive.walkingLat + ',' + arrive.walkingLong + '&ak=' + ak;
                    }else if(type == 'driving'){
                        host = 'http://api.map.baidu.com/routematrix/v2/driving?output=json&origins='
                            + depart.drivingLat +','+ depart.drivingLong + '&destinations='+ arrive.drivingLat + ',' + arrive.drivingLong + '&ak=' + ak;
                    }

                    request.get({'url': host}, function(error, request, body){
                        if(!error){
                            var jsonBody = JSON.parse(body);

                            var duration = getDuration(jsonBody.result[0].duration.value);
                            var distance = getDistance(jsonBody.result[0].distance.value);

                            res.render('transport', {depart: depart, arrive : arrive, duration : duration, distance : distance, type: type, transportType : 'food', nickName: nickName});
                        }
                    }).on('error', function(e){
                        console.log(e)
                    }).end()
                }
            }
            connection.release();
        })
        })
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

module.exports = router;
