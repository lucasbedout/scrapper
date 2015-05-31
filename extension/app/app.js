$(document).ready(function (){
	// Get current Tab
	chrome.tabs.query({active: true}, function (tabs) {
		tabs.forEach(function(tab) {
			chrome.tabs.executeScript(tab.id, {code: "var html = document.querySelector('html').innerHTML; html;"}, function(result) {
				if (result && result[0])
					detectProducts(tab.url, result[0]);
				else
					detectProducts(tab.url);
		    });
		});
	});
});

/* Products detection */

function detectProducts(url, page) {
	$.ajax(
	{
		type: 'POST',
		url: 'http://localhost:3000/detect',
		data: {
			url: url,
			page: page
		},
		success: function (products) {
			printProducts(products);
		},
		error: function (data)
		{
			setMessage('error', 'Erf, on a pas trouvé de produits là');
		}
	});
}

/* POST product */

function postProduct(url, auth)
{
	$.ajax(
	{
		type: 'POST',
		url: 'http://api.nouvelle-collection.com/v1/products',
		headers: {
			'Authorization': auth.token.token_type + ' ' + auth.token.access_token
		},
		data: {
			url: url,
			status: 1,
			user_id: auth.user.id,
			edition: 0,
			priority: 50
		},
		success: function (data)
		{
			printProducts(data);
		},
		error: function (data)
		{
			console.log(data);
			switch(data.responseJSON.code)
			{
				case 404:
					setMessage('error', "Le site marchand pour ce produit ne semble pas être affiliable pour le momment");
				break;
				default:
					setMessage('error', "Le produit n'a pas pu être ajouté à la sélection");
				break;
			}
		}
	});
}


/* SET message */

function setMessage (type, message)
{
	// REMOVE loader
	$('.loader').removeClass('active');

	// SET type
	$('.message').removeClass('success').removeClass('error').addClass(type).html(message);
}

function printProducts(products) {
	var template = '<h3>{{product.name}}</h3><em>{{product.price}}€</em><img src="{{product.picture}}" alt="" />';
	var view = '';

	products.forEach(function(product) {
		view += Mustache.render(template, {product: product});
	});

	console.log(view);
	$('.loader').removeClass('active');
	$('#products').html(view);
}
