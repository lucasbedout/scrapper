
var DOMFinder = function(dom) {

    // Keep a reference to the original this and simplify code lecture
    var _ = this;

    // cheerio loaded content
    var $ = dom;

    // DOM elements to search into
    var DOMElements = ['div', 'span', 'p', 'a', 'li', 'h1', 'h2', 'h3', 'meta', 'img', 'section', 'ul', 'li'].join();

    // Data to search
    var props = ['name', 'price', 'description', 'brand', 'image'];

    /*
     * Each findSomething function return a cheerio DOM element from a given container
     * The finder is not responsible of data extraction
     */

    _.findProducts = function() {
        var products = [];
        // First of all, we are looking for an itemtype (rich snippets)
        var elements = findProductFromSnippets();
        // For each element, we get the product informations and add them to products
        elements.each(function(i, elem) {
            var product = {};
            props.forEach(function(prop) {
                product[prop] = findDataBySnippet(elem, prop);
            });
            products.push(product);
        });

        if (products.length > 0) {
            return products;
        }

        // Manual finding

        // Does the page contains product(s)
        elements = _.getMatchingElements('product');
        // Arbitrary test, work on several websites
        if (elements.length < 10) {
            return false;
        }
        // Attempt to get product containers
        containers = findContainers(elements);
        if (containers.length === 0) {
            return false;
        }

        // We have the containers, let's look for informations
        $(containers).each(function(i, elem) {
            var product = {
                name: _.findProductName(elem),
                price: _.findProductPrice(elem),
                image: _.findProductPicture(elem)
            };

            products.push(product);
        });
        return products;

    };

    // Find possible product containers
    var findContainers = function(elements) {
        var containers = _.getMatchingElements(['product', 'item']);
        containers = removeUselessElements(containers);
        return containers;
    };

    var removeUselessElements = function(elements) {
        elements = removeLeaves(elements);
        // Look for element containing our informations
        var infoDictionary = ['info', 'detail', 'caracteristics', 'caption', 'item', 'summary'];
        elements = removeWithDictionary(elements, infoDictionary);
        // Look for an element containg our informations + at least a picture
        var photoDictionary = ['picture', 'photo', 'image'];
        elements = removeWithDictionary(elements, photoDictionary);
        elements = removeWithPrice(elements);
        var containers = removeWithTitle(elements);
        return containers;
    };

    // Remove elements which contains another element in the set
    var reduceToContainedElements = function(elements) {
        var containers = [];
        $(elements).each(function(i, elem) {
            var container = false;
            $(elements).each(function(j, el) {
                if ($.contains($(elem), $(el))) {
                    container = true;
                }
            });
            if (!container) {
                containers.push(elem);
            }
        });
        return containers;
    };

    var removeWithPrice = function(elements) {
        var containers = [];
        $(elements).each(function(i, elem) {
            var price = findPricingElements(elem);
            if (price.length > 0) containers.push(elem);
        });
        return containers;
    };

    var removeWithTitle = function(elements, title) {
        var containers = [];
        var tags = ['div', 'span', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].join();
        $(elements).each(function(i, elem) {
            var dom = $(elem).find(tags);
            var leaves = getLeaves(dom);
            var score = 0;
            $(leaves).each(function(i, leaf) {
                var text = $(leaf).text();
                if (text.length > 20 && text.length < 100) {
                    if (title) containers.push(leaf);
                    else score++;
                }
            });
            if (score > 0) containers.push(elem);
        });
        return containers;
    };

    var removeWithDictionary = function (elements, dictionary) {
        elements = $(elements).filter(function(i, elem) {
            var matches = _.getMatchingElements(dictionary, elem);
            return matches.length > 0;
        });
        return elements;
    };

    var getLeaves = function(elements) {
        var leaves = [];

        $(elements).each(function(i, elem) {
            if ($(elem).children().length === 0)
                leaves.push(elem);
        });
        return leaves;
    };

    var removeLeaves = function(elements) {
        var containers = [];
        $(elements).each(function(i, elem) {
            if ($(elem).children().length > 1) {
                containers.push(elem);
            }
        });
        return containers;
    };

    var findProductFromSnippets = function() {
        var elements = $(DOMElements).filter(function(i, elem) {
            var a =  $(this).attr('itemtype');
            if (typeof a !== typeof undefined && a !== false) {
                return a.toLowerCase().indexOf('product') !== -1;
            }
        });

        return elements;
    };

    // Find the name of the product in a given container
    _.findProductName = function(elem) {
        var titles = removeWithTitle(elem, true);

        return oneSevOrNull(titles);

    };

    // Find the price of the product in a given container
    _.findProductPrice = function(elem) {
        var prices = [];
        var tags = findPricingElements(elem);
        $(tags).each(function(i, elem) {
            prices.push(elem);
        });
        return oneSevOrNull(prices);
    };

    _.findProductDescription = function(elem) {

    };

    _.findProductPicture = function(elem) {
        var pictures = [];
        $(elem).find('img').each(function(i, el) {
            pictures.push(el);
        });
        return pictures;
    };

    findProductBrand = function(elem) {

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

    findDataBySnippet = function(elem, snippet) {
        var element = $(elem).find('[itemprop=' + snippet + ']').first();
        return element;
    };

    // Private method used to find princing HTML elements
    var findPricingElements = function(node) {
        node = node ? $(node).find(DOMElements) : DOMElements;
        var elements = $(node).filter(function(i, elem) {
            if ($(this).children().length !== 0) {
                return false;
            }
            // We validate symbol presence
            var index = $(this).text().indexOf('€');
            if (index < 0) index = $(this).text().indexOf('EUR');
            // We check if the symbol comes with a price
            return index > 2 && isPrice($(this).text());
        });

        return elements;
    };

    var isPrice = function(priceStr) {
        var price = priceStr.replace('€', '').replace('EUR', '').replace(',', '.').replace(' ', '');
        return !isNaN(parseFloat(price)) && isFinite(price) && parseFloat(price) > 0;
    };

    // Find if a price is in a product schema and return the schema
    var productSchemaFromPricing = function(priceElement) {

    };

    // Return an array of element with id, class, title or content contains str in node
    _.getMatchingElements = function(str, node) {
        var elements = [];
        node = node ? $(node).find(DOMElements) : DOMElements;

        elements = elements.concat(findByMatchingAttributes(str, node));
        elements = elements.concat(findByMatchingContent(str, node));

        return elements;
    };

    var isElementMatching = function(elem, slug) {
        var attrs = ['class', 'id', 'title', 'name', 'src'];
        var score = 0;
        attrs.forEach(function(attr) {
            var a =  $(elem).attr(attr);
            if (typeof a === typeof undefined || a === false) {
                return false;
            }
            if (Array.isArray(slug)) {
                slug.forEach(function(str) {
                    return a.indexOf(str) !== -1 ? score++ : false;
                });
            } else {
                return a.indexOf(slug) !== -1 ? score++ : false;
            }
        });
        return score > 0;
    };

    var findByMatchingAttributes = function(str, node) {
        var elements = [];

        // We filter the Dom elements
        var domElems = $(node).filter(function(i, elem) {
            return isElementMatching(this, str);
        });
        domElems.each(function(i, el) {
            elements.push($(this));
        });
        return elements;
    };

    var findByMatchingContent = function(str, node) {
        var elements = [];

        var domElems = $(node).filter(function(i, elem) {
            return $(this).text().indexOf(str) !== -1;
        });
        domElems.each(function(i, el) {
            elements.push($(this));
        });

        return elements;
    };



};


module.exports = DOMFinder;
