/**
 * Created by yunchae.na on 2017-01-09.
 */
var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var request = require('request');
// var http = require('http');

//GET foodShopMap Basic rendering
router.get('/', function (req, res, next) {
      res.render('foodShopList');
});

//GET foodShopList
router.post('/shopList', function (req, res, next) {

    console.log('req.body', req.body);

    var ak = 'HzG9TZi2bzeiGmAPQyV0eAPYzea02TbU';
    var host = 'http://api.map.baidu.com/geocoder/v2/?address=' + req.body.addr+ '&output=json&ak=' + ak + '&callback=showLocation';

    console.log('host', host);

    request.get({'url': host}, function(error, request, body){
        if(!error){
            var jsonBody = JSON.parse(body);
            console.log("result", jsonBody.result[0].location)
            console.log("result lng", jsonBody.result[0].location.lng)
            console.log("result lat", jsonBody.result[0].location.lat)

            var lng = jsonBody.result[0].location.lng;
            var lat = jsonBody.result[0].location.lat;

            getConnection(function (err, connection){
                var query = 'select * from TB_FOOD_SHOP_LIST where LATITUDE_WALK between ? and ? and LONGITUDE_WALK between ? and ?';
                // var query = 'select * from TB_FOOD_SHOP_LIST where LONGITUDE_WALK between ? and ? and LATITUDE_WALK between ? and ?';
                var northEastLat = req.body.neLat;
                var northEastLng = req.body.neLng;
                var southWestLat = req.body.swLat;
                var southWestLng = req.body.swLng;

                connection.query(query, [southWestLat, northEastLat, southWestLng, northEastLng], function (err, row) {
                    if (err) {
                        console.error("err : " + err);
                        throw err;
                    }else{
                        res.send({data:row, lat : lat, lng : lng});
                    }
                    connection.release();
                })
            });

        }
    }).on('error', function(e){
        console.log(e)
    }).end()
});


//GET foodShop detail Information
router.get('/shopInfo', function (req, res, next) {
    getConnection(function (err, connection) {
        var query = 'select * from TB_FOOD_SHOP_LIST A, TB_FOOD_MENU B where A.FOOD_ID = B.FOOD_ID and A.FOOD_ID = ?';
        var id = req.query.id; // foodList Id

        connection.query(query, id, function (err, rows) {
            if (err) {
              //  console.error("err : " + err);
                throw err;
            }else{
               // console.log("rows : " + JSON.stringify(rows));

                if(rows.length > 0){
                    res.render('foodShopInfo', {rows : rows, length:rows.length});
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
        var query = 'select * from TB_FOOD_SHOP_LIST where FOOD_ID = ?';
        var id = req.query.id; // foodList Id
        var type = req.query.transportType;

        connection.query(query, id, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                if(rows.length > 0){
                var depart = {};
                depart.nameCn = '鹿港小镇';
                depart.nameKr = '벨라지오 Bellagio';
                depart.addrWalking = '黄浦区豫园路85号(近九曲桥)';
                depart.addrTaxi = '港汇恒隆广场 (华山路口)';
                depart.walkingLong = '121.49815490071883';
                depart.walkingLat = '31.232280291456389';
                depart.drivingLong = '121.4442219027139';
                depart.drivingLat = '31.201250489726449';

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

                            res.render('transport', {depart: depart, arrive : arrive, duration : duration, distance : distance, transportType: type});
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
