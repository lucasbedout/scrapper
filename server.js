var Downloader = require('./Downloader.js');
var Extract = require('./parser/Extract.js');

var url = 'http://fr.topshop.com/fr/tsfr/produit/chaussures-415225/chaussures-%C3%A0-talons-415253/sandales-%C3%A0-crampons-hypnotic-4345025?bi=1&ps=20';
Downloader.getContent(url, function(err, data) {
    if (err) {
        console.log(err);
    }

    var $ = new Extract(data);

    var isValid = $.productsInfos(function(err, products) {
        if (err) {
            return console.log(err);
        }

        return console.log(products);
    });

});
