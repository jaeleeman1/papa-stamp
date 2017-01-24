/**
 * Created by yunchae.na on 2017-01-23.
 */
var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var request = require('request');


router.get('/transport', function (req, res, next) {

    getConnection(function (err, connection) {
        var query = 'select * from TB_ROAD_INFO where USER_OPEN_ID = ? order by ROAD_SEQ DESC limit 1';
        var id = req.query.id; // user open id
        var type = req.query.type;

        connection.query(query, id, function (err, rows) {
            if (err) {
                //  console.error("err : " + err);
                throw err;
            }else{
                if(rows.length > 0){
                    var depart = {};
                    depart.nameCn = rows[0].START_NM_CN;
                    depart.nameKr = rows[0].START_NM_KR;
                    depart.addrWalking = rows[0].START_WALK_ADDR_CN;
                    depart.addrTaxi = rows[0].START_TAXI_ADDR_CN;
                    depart.walkingLong = rows[0].START_LONGITUDE_WALK ;
                    depart.walkingLat = rows[0].START_LATITUDE_WALK ;
                    depart.drivingLong = rows[0].START_LONGITUDE_TAXI ;
                    depart.drivingLat = rows[0].START_LATITUDE_TAXI;

                    console.log('depart', depart);

                    var arrive = {};
                    arrive.id = rows[0].USER_OPEN_ID
                    arrive.nameCn = rows[0].END_NM_CN;
                    arrive.nameKr = rows[0].END_NM_KR ;
                    arrive.addrWalking = rows[0].END_WALK_ADDR_CN ;
                    arrive.addrTaxi = rows[0].END_TAXI_ADDR_CN ;
                    arrive.walkingLong = rows[0].END_LONGITUDE_WALK ;
                    arrive.walkingLat = rows[0].END_LATITUDE_WALK ;
                    arrive.drivingLong = rows[0].END_LONGITUDE_TAXI ;
                    arrive.drivingLat = rows[0].END_LATITUDE_TAXI;

                    console.log('arrive', arrive);

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

                            res.render('transport', {depart: depart, arrive : arrive, duration : duration, distance : distance, type: type});
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