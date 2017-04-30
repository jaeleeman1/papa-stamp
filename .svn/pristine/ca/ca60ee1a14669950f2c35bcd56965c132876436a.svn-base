var express = require('express');
var router = express.Router();
var getConnection = require('../lib/db_connection');

//GET User Information
router.get('/getUserInfo', function (req, res, next) {
	getConnection(function (err, connection) {
		if(JSON.stringify(req.query) == '{}') {
			res.status(404);
			res.json({
				"success" : 0,
				"message" : "Parameters missing"
			});
			return false;
		}
		
	        var query = 'select USER_OPEN_ID from TB_USER_INFO where USER_WECHAT_ID = ?';
        	var id = req.query.wechatId;
        	
	   	connection.query(query, id, function (err, rows) {
            		if (err) {
                		console.error("err : " + err);
                    		throw err;
            		}else{
		        	if(rows.length > 0) {
                        		res.json(rows[0]);
                    		}else {
					res.status(404);
					res.json({
						"success" : 0,
						"message" : "Data is empty"
					});
					return false;
				}
            		}
            		connection.release();
        	});
    	});
});

//GET Road Information
router.get('/getRoadInfo', function (req, res, next) {
	getConnection(function (err, connection) {
		if(JSON.stringify(req.query) == '{}') {
			res.status(404);
			res.json({
				"success" : 0,
				"message" : "Parameters missing"
			});
			return false;
		}
		
	        var query = 'select USER_OPEN_ID from TB_ROAD_INFO where START_ADDR_KR = ?';
        	var id = req.query.wechatId;
        	
	   	connection.query(query, id, function (err, rows) {
            		if (err) {
                		console.error("err : " + err);
                    		throw err;
            		}else{
		        	if(rows.length > 0) {
                        		res.json(rows[0]);
                    		}else {
					res.status(404);
					res.json({
						"success" : 0,
						"message" : "Data is empty"
					});
					return false;
				}
            		}
            		connection.release();
        	});
    	});
});

module.exports = router;
