var exec = require('child_process').exec,
    fs = require('fs');

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
    }

};

module.exports = Downloader;
