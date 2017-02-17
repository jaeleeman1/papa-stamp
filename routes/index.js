var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');
var request = require('request');
var xml2js = require('xml2js');
var config = require('../lib/config');

/* GET home page. */
router.get('/', function(req, res, next) {

    getConnection(function (err, connection){
        var query =   'select FOOD_ID, FOOD_ADDR_CN, TAXI_ADDR_CN from TB_FOOD_SHOP_LIST';

        connection.query(query, function (err, row) {
            if (err) {
                console.error("err : " + err);
                throw err;
            }else{

              for( var i=0; i < row.length; i++){
                  var id = row[i].FOOD_ID;
                  var addr = row[i].FOOD_ADDR_CN;
                  var taxi = row[i].TAXI_ADDR_CN;

                  if(taxi == '' || taxi == undefined || taxi == null){
                      taxi = addr;
                  }

                  var ak = 'HzG9TZi2bzeiGmAPQyV0eAPYzea02TbU';
                  var host = 'http://api.map.baidu.com/geocoder/v2/?address=' + addr.trim + '&output=json&ak=' + ak + '&callback=showLocation';
                  request.get({'url': host}, function(error, request, body) {
                      if (!error) {

                          var data = body;
                          var json1 = data.split('(');
                          var json2 = json1[1].split(')');
                          var jsonBody = JSON.parse(json2[0]);

                          var lngAddr = jsonBody.result.location.lng;
                          var latAddr = jsonBody.result.location.lat;

                          var host = 'http://api.map.baidu.com/geocoder/v2/?address=' + taxi.trim + '&output=json&ak=' + ak + '&callback=showLocation';
                          request.get({'url': host}, function(error, request, body) {
                              if (!error) {

                                  var data = body;
                                  var json1 = data.split('(');
                                  var json2 = json1[1].split(')');
                                  var jsonBody = JSON.parse(json2[0]);

                                  var lngTaxi = jsonBody.result.location.lng;
                                  var latTaxi = jsonBody.result.location.lat;

                                  console.log('lngAddr', lngAddr);
                                  console.log('latAddr', latAddr);
                                  console.log('lngTaxi', lngTaxi);
                                  console.log('latTaxi', latTaxi);
                              }
                          });
                      }
                  });
              }
            }
            connection.release();
        })
    });
});

module.exports = router;
