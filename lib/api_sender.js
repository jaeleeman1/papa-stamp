var request = require('request');
var sender = {};
var ACCESS_TOKEN = new Object();

sender.shoppingResSend =  function(req, res) {
    console.log('start post : shopping result send  ');

    var ProductSet  = JSON.parse(JSON.stringify(req.body));

    // console.log('XXXXXXXXXXXXXXXXXXXXXXX : ' + JSON.stringify(req.body));

    console.log('ProductSet User_Open_Id : ' + ProductSet.User_Open_Id);
    console.log('ProductName : ' + ProductSet.Prdct[0].Prdct_Nm);
    //console.log('Product length : ' + ProductSet.Prdct.length);


    if(ProductSet == '{}') {
        console.log('error : 400');
        return false;
    }



    var total_amount    = 0;
    var shoppingResult  = ProductSet.Prdct.length +'개 물품 주문 접수 되었습니다. \n';

    shoppingResult  += '--------------------------------------- \n';
    for(var i = 0; i <  ProductSet.Prdct.length; i++)
    {

        shoppingResult += 	ProductSet.Prdct[i].Prdct_Nm + "\n " +
            ": 수량"+ProductSet.Prdct[i].Prdct_Cnt+ "개 |" +
            "￥ " + ProductSet.Prdct[i].Price * ProductSet.Prdct[i].Prdct_Cnt + "\n "

        total_amount += ProductSet.Prdct[i].Price * ProductSet.Prdct[i].Prdct_Cnt;
    }

    shoppingResult += "\n 합계 ￥" + total_amount ;
    shoppingResult += '\n --------------------------------------- \n';

    console.log( shoppingResult);


    function getToken() {
        console.log(' get token start ');

        //official (3��)
        var appID = 'wx87ac1cef286fb38d';
        var appsecret = '39278936f9e35c2e82ed57f25a05717f';


        var accessTokenURL = "https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid="+appID+"&secret="+appsecret;
        var accessTokenOptions = {
            method: "GET",
            url: accessTokenURL,
        };
        console.log(' get token start2 ');
        function accessTokenCallback (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                ACCESS_TOKEN.access_token = data.access_token;
                ACCESS_TOKEN.expiration = (new Date().getTime()) + (data.expires_in - 10) * 1000;

                // console.log("New access token retrieved: " + ACCESS_TOKEN.access_token);

                console.log(' get token start3 ');
                //token 받고 조립한 결과 전송
                pushChat( ProductSet.User_Open_Id, shoppingResult );

            }else{
                console.log(' get token start 5');
            }
        }
        console.log(' get token start 4');
        request(accessTokenOptions, accessTokenCallback);
    };

    getToken( );


    console.log(' get token end ');
    return true;
} ;


function pushChat(openId, Result) {
    console.log(' pushChat start ');

    var pushChatURL = "https://api.wechat.com/cgi-bin/message/custom/send?access_token="+ACCESS_TOKEN.access_token;

    var pushChatOptions = {
        method: "POST",
        url: pushChatURL,
        body: JSON.stringify({
            "touser" : openId,
            "msgtype":"text",
            "text":
                {
                    "content":Result
                }
        })
    };

    function pushChatCallback (error, response, body) {
        // console.log("log : " + body);
        if (!error && response.statusCode == 200) {
            bodyObject = JSON.parse(body);
            if (bodyObject.errmsg === "ok") {
                console.log("Message successfully delivered--"  );
                // res.status(200).send('Send Sucess');

            } else {// this doesn't work until restarting server ***
                console.log( " There was an error delivering the message: " + Result
                    + "  statusCode: "+response.statusCode + " error :" + error);
            }
        }
    }

    request(pushChatOptions, pushChatCallback);
}

module.exports = sender;






