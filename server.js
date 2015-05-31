var express = require('express');
var app = express();
var Downloader = require('./Downloader.js');
var Extract = require('./parser/Extract.js');
var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.post('/detect', function (req, res) {
    var url = req.body.url.replace('www.', '').replace(' ', '%20');
    var page = req.body.page;

    if (page) {
        var $ = new Extract(page);

        var isValid = $.productsInfos(function(err, products) {
            if (err) {
                return res.status(400).send(err);
            }

            return res.json(products);
        });
    } else {
        Downloader.getContent(url, function(err, data) {
            if (err) {
                console.log(err);
            }

            var $ = new Extract(data);

            var isValid = $.productsInfos(function(err, products) {
                if (err) {
                    return res.status(400).send(err);
                }

                return res.json(products);
            });
        });

    }
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
