var express = require('express');
var router = express.Router();
//var path = require('path');
//var mime = require('mime');

const TAG = 'Router: DownloadManager:';

router.get('/ssup.apk', function(req, res, next) {
    var filepath = __dirname + '/../download/ssup-v0.1.12.apk'
    //console.log(TAG, '__dirname: ' + __dirname);
    console.log(TAG, 'filepath: ' + filepath);

    //var filename = path.basename(filepath);
    //var mimetype = mime.lookup(filepath);
    //console.log(TAG, 'filename: ' + filename);
    //console.log(TAG, 'mimetype: ' + mimetype);

    res.download(filepath);
});

module.exports = router;