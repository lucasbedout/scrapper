var exec = require('child_process').exec,
    fs = require('fs'),
    phantom = require('phantom');

var Downloader = {
    // Download a web page with wget and return the content
    getContent: function(url, callback) {
        child = exec('wget -O index.html ' + url, function (error, stdout, stderr) {
            if (error) {
                callback(error, null);
            }
            fs.readFile('/Users/stark/Desktop/node/index.html', 'utf8', function (err, data) {
                callback(null, data);
            });
        });
    },

    getContentPhantom: function(url, callback) {
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                page.open('http://google.com', function (status) {
                    console.log(status);
                    page.evaluate(function () { return document.getElementsByTagName('html')[0].innerHTML; }, function (result) {
                        console.log('coucou');
                    });
                });
                ph.exit();
            });
        });
    }

};

module.exports = Downloader;
