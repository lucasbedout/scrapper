var Loader = require('./Loader.js');
var DOMFinder = require('./DOMFinder.js');

var Extract = function(data) {

    // Keep a reference to the original this and simplify code lecture
    var _ = this;

    // cheerio loaded content
    var $ = Loader.loadHTML(data);

    // DOMFinder init
    var DOM = new DOMFinder($);

    var products = [];

    // Return the product informations
    _.productsInfos = function(callback) {
        var DOMproducts = DOM.findProducts();

        if (!DOMproducts) {
            return callback('ERROR', false);
        }
        DOMproducts.forEach(function(product) {
            products.push({
                name: _.stringInfo(product.name),
                price: _.priceInfo(product.price),
                description: _.stringInfo(product.description),
                brand: _.stringInfo(product.brand),
                picture: _.pictureInfo(product.image)
            });
        });

        products = _.sanitize(products);

        return callback(null, products);

    };

    // Return the product name from the extracted DOM element
    _.stringInfo = function(elem) {
        if (!elem)
            return null;

        var names = [];
        if (typeof elem === 'object') {
            $(elem).each(function(i, el) {
                var tag = elem[0] ? elem[0].name : elem.name;
                console.log('Tag', tag);
                if (tag != 'meta') {
                    names.push($(el).text());
                } else {
                    names.push($(el).attr('content'));
                }
            });
            return oneSevOrNull(names);
        } else {
            return $(elem).text();
        }
    };

    // Return the product price from the extracted DOM element
    _.priceInfo = function(elem) {
        if (!elem)
            return null;
        var prices = [];
        if (typeof elem === 'object') {
            $(elem).each(function(i, el) {
                var tag = elem[0] ? elem[0].name : elem.name;
                if (tag != 'meta') {
                    prices.push(strToPrice($(el).text()));
                } else {
                    prices.push(strToPrice($(el).attr('content')));
                }
            });
            return oneSevOrNull(prices);
        } else {
            return strToPrice($(elem).text());
        }
    };

    var strToPrice = function(str) {
        return str.replace('€', '').replace('EUR', '').replace(',', '.').replace(' ', '').replace('\n', '');
    };

    // Return the product picture URL from the extracted DOM element
    _.pictureInfo = function(elem) {
        if (!elem)
            return null;

        var pictures = [];
        if (Array.isArray(elem)) {
            $(elem).each(function(i, el) {
                var link = $(el).attr('src');
                if (link && pictures.indexOf(link) < 0 && link.indexOf('http://') >= 0)
                    pictures.push($(el).attr('src'));
            });
            return oneSevOrNull(pictures);
        } else {
            return $(elem).attr('src');
        }
    };

    // Used to find if we have product with the same name
    _.sanitize = function(products) {
        var sanitized = [];
        products.forEach(function(product) {
            var san = true;
            // Remove current product from the test array
            if (Array.isArray(product.name) && product.name.length > 3)
                san = false;
            if (san)
                sanitized.push(product);
        });
        return sanitized;
    };

    // Return the array, a string or null
    var oneSevOrNull = function(arr) {
        if (arr.length === 0)
            return null;
        if (arr.length == 1) {
            return arr[0];
        }
        return arr;
    };

};


module.exports = Extract;
