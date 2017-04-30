var database = {};
var Sequelize = require('sequelize');
var config = require('./config');

//Initialize database
var sequelize = new Sequelize(config.database, config.username, config.password, {
	dialect: 'mysql',
	host: 'cphone.cwv6eeev1qqm.ap-northeast-2.rds.amazonaws.com',
	port: 43306,
	timestamps: false
});

var mysql_clean = function (string) {
	return sequelize.getQueryInterface().escape(string);
};


database.getUserInfo = function (req, callback) {
	console.log("##### database get user info#####");
	
	if(JSON.stringify(req.body) == '{}') {
		console.log('error : 400');
		return false;
	}
	
	var query = "select USER_OPEN_ID from TB_USER_INFO where USER_WECHAT_ID = '";
	var id = req.body.wechatId;
	var json = {};
	
	sequelize.query(query + id +"'" , { type: sequelize.QueryTypes.SELECT})
	.then(function(rows) {
		if(!rows.length) {
			console.log('error : 400');
		}
		console.log('success : 200');
		return callback(JSON.stringify(rows[0]));
	})
	.catch( function(err) {
		err.status = 400;
	});
	
};

module.exports = database;
