var express = require('express');
var router = express.Router();
var FCM = require('fcm-push');
var config = require('../config/service_config');

const serverKey = config.serverKey;
const TAG = 'Notification';

var notificationType = {
    "NOTIFICATION_TYPE_UNDEFINED" : 0,
    "NOTIFICATION_TYPE_ORDER_NOTIFICATION" : 1
};

router.post('/finish_order/:uid/', function(req, res, next) {
    console.log(TAG, 'POST: Send notification');

    var uid = req.params.uid;

    console.log(TAG, 'requested UID: ' + uid);

    /*var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var distance = req.body.distance;
    var nickname = req.body.nickname;
    var expression = req.body.expression;
    var type = req.body.type;

    console.log(TAG, 'latitdue: ' + latitude + ', longitude: ' + longitude
        + ', distance: ' + distance + ', nickname: ' + nickname
        + ', expression: ' + expression + ', type: ' + type);*/

    /*getConnection(function(err, connection){
        if (err) {
            console.log(TAG, 'Failed to get DB connection');
        } else {
            const query = 'SELECT account_table.uid, account_table.access_token, profile_table.user_status FROM account_table JOIN profile_table WHERE account_table.uid = profile_table.uid AND account_table.uid = ?';
            connection.query(query, receiverUid, function(err, rows){
                if (err) {
                    console.log(TAG,
                        'sendSsupNotification() SELECT account_table & profile_table, error: '
                        + err);
                } else if (rows && rows[0] && rows[0].user_status === 0) { // Available status
                    console.log(TAG, 'Receiver UID: ' + rows[0].uid);
                    console.log(TAG, '- Access token: ' + rows[0].access_token);
                    console.log(TAG, '- User status: ' + rows[0].user_status);

                    var info = {
                        uid: senderUid,
                        latitude: latitude,
                        longitude: longitude,
                        distance: distance,
                        nickname: nickname,
                        expression: expression
                    };

                    console.log(TAG, 'Sender uid: ' + info.uid);
                    console.log(TAG, '- Latitude: ' + info.latitude
                        + ', longitude: ' + info.longitude + ', distance: ' + info.distance);
                    console.log(TAG, '- Nickname: ' + info.nickname
                        + ', expression: ' + info.expression);

                    switch (type) {
                        case 1: // SSUP
                            console.log(TAG, 'SSUP noti');
                            sendNotification(rows[0].access_token,
                                notificationType.NOTIFICATION_TYPE_SSUP_NOTIFICATION, info);
                            break;
                        case 2: // SSUP reply
                            console.log(TAG, 'SSUP reply noti');
                            sendNotification(rows[0].access_token,
                                notificationType.NOTIFICATION_TYPE_SSUP_REPLY_NOTIFICATION, info);
                            break;
                        case 3: // Chat start
                            console.log(TAG, 'Chat start noti');
                            sendNotification(rows[0].access_token,
                                notificationType.NOTIFICATION_TYPE_CHAT_START_NOTIFICATION, info);
                            break;
                        default:
                            console.log(TAG, 'SSUP notification type error');
                            break;
                    }
                }

                connection.release();
            });
        }
    });*/

    var info = {
        uid: uid,
        nickname: "[주문 완료]"
    };

    sendNotification("doaOAZeSVJU:APA91bEqjuoPOdiylGT48IEGLfT0Yp-pDX8_JiNPgIM4xGyA9j7z4m6dUqK3n867EWzmCdnEUk6DhPlijovedBWxFeFx4cUocafuy2yQ0LpbGff8SdOGJj3TlWsYAleNjDnBgBgBgu18",
        notificationType.NOTIFICATION_TYPE_ORDER_NOTIFICATION, info);

    res.status(200);
    res.send('sendSsupNotification response ok');
});

var sendNotification = function sendNotification(accessToken, notiType, info) {

    switch (notiType) {
        case notificationType.NOTIFICATION_TYPE_ORDER_NOTIFICATION:
            var callapse_key = 'ORDER';
            var title = info.nickname;
            var body = '01026181715 님의 주문이 완료되었습니다.';
            var tag = 1;
            break;
        default:
            console.log(TAG, 'Undefined notification type');
            return;
    }


    var message = {
        to: accessToken,
        collapse_key: callapse_key,
        notification: {
            title: title,
            body: body,
            icon: '/images/cafejass/couphone.png',
            tag: tag
        },
        data: {
            msgType: callapse_key,
            uid: info.uid,
            nickname: info.nickname
        }
    };


    var fcm = new FCM(serverKey);
    fcm.send(message, function(err, res){
        if (err) {
            console.log(TAG, "Failed to send notification, error: " + err);
        } else {
            console.log(TAG, "Successfully sent with response: ", res);
        }
    });
};

module.exports = router;