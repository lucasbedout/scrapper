var cheerio = require('cheerio');

var Loader = {
    // Just a shortcut to load HTML to cheerio
    loadHTML: function(data) {
        return cheerio.load(data, {ignoreWhitespace: true});
    }

};

module.exports = Loader;
