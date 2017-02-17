var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //
    // var dataString = {
    //     User_Open_Id : "oH7FywN073pRVpCF0G6nMl6iI8mg",
    //     Prdct :
    //         [
    //             {Prdct_Nm : "Coffee1", Prdct_Cnt : "8", Price:"20" },
    //             {Prdct_Nm : "Coffee2", Prdct_Cnt : "4", Price:"25" },
    //             {Prdct_Nm : "Coffee3", Prdct_Cnt : "5", Price:"30" }
    //         ]
    // };
    //
    //
    // console.log('dataString', dataString.Prdct[0].P);


  res.render('mapTest3');
});

module.exports = router;
