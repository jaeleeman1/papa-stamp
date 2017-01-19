/**
 * Created by yunchae.na on 2017-01-09.
 */
var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var request = require('request');
var http = require('http');

//GET foodShopMap Basic rendering
router.get('/', function (req, res, next) {
      res.render('foodShopList');
});

//GET foodShopList
router.get('/shopList', function (req, res, next) {
    getConnection(function (err, connection){
        var query = 'select * from TB_FOOD_SHOP_LIST';

        connection.query(query, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{
                console.log("foodShopList success : " + JSON.stringify(row));
                res.send({data:row});
            }
            connection.release();
        })
    });
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
        var id = req.query.foodId; // foodList Id

        connection.query(query, id, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{

                // console.log('transport', rows[0]);

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
                arrive.nameCn = rows[0].FOOD_NAME_CN;
                arrive.nameKr = rows[0].FOOD_NAME_KR ;
                arrive.addrWalking = rows[0].FOOD_ADDR_CN ;
                arrive.addrTaxi = rows[0].TAXI_ADDR_CN ;
                arrive.walkingLong = rows[0].LONGITUDE ;
                arrive.walkingLat = rows[0].LATITUDE ;
                arrive.drivingLong = rows[0].LONGITUDE ;
                arrive.drivingLat = rows[0].LATITUDE;

                var ak = 'HzG9TZi2bzeiGmAPQyV0eAPYzea02TbU';
                var host = 'http://api.map.baidu.com/routematrix/v2/walking?output=json&origins='
                                + depart.walkingLat +','+ depart.walkingLong + '&destinations='+ arrive.walkingLat + ',' + arrive.walkingLong + '&ak=' + ak;

                    request.get({'url': host}, function(error, request, body){
                        if(!error){
                            var jsonBody = JSON.parse(body);

                            var durationBase = 60;
                            var distanceBase = 1000;
                            var duration = jsonBody.result[0].duration.value;
                            var distance = jsonBody.result[0].distance.value;

                            var calculateDuration = getDuration(duration, durationBase);
                            var calculateDistance = getDistance(distance, distanceBase);

                            console.log('calculateDuration', calculateDuration);
                            console.log('calculateDistance', calculateDistance);

                            res.render('foodTransport', {depart: depart, arrive : arrive, distance : calculateDistance, duration : calculateDuration});
                        }
                    }).on('error', function(e){
                        console.log(e)
                    }).end()
                }else{
                    // res.render('foodShopList');
                }
            }
            connection.release();
        })
        })
});

var getDuration = function(duration, durationBase) {
    if (duration >= durationBase) {
        if (duration % durationBase != 0) {
            return duration / durationBase + '시간 ' + duration % durationBase + '분';
        } else {
            return duration / durationBase + '시간';
        }
    } else {
        return durationBase + '분';
    }
}

var getDistance = function (distance, distanceBase) {
    if(distance >= distanceBase){
        if(distance%distanceBase != 0){
            return distance/distanceBase + 'km ' + distance%distanceBase + 'm';
        }else{
            return distance/distanceBase + 'km';
        }
    }else{
        return distance + 'm';
    }
}

module.exports = router;
