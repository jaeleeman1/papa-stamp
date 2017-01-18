var express = require('express');
var router = express.Router();

//GET User Information
router.get('/', function (req, res, next) {
	res.render('mapTest');
});
module.exports = router;
