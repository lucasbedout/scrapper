$(document).ready(function ()
{

	// Form submit

	$('#connexion-form').submit(function (e)
	{
		e.preventDefault();
		connexion();
	});


});



/* Connexion */

function connexion ()
{
	// Get informations
	var username = $('#input-username').val();
	var password = $('#input-password').val();
	if(username.length == 0 || password.length == 0){ updateError("Vous devez spécifier un username et un password", true); return false; }
	else
	{
		// Connexion
		$.ajax(
		{
			type: 'POST',
			url: 'http://api.nouvelle-collection.com/oauth/access_token',
			data: {
				username: username,
				password: password,
				grant_type: 'password',
				client_id: '64he6HRY63Eeh',
				client_secret: 'pierralexandre'
			},
			success: function (data)
			{
				// Save informations in localstorage
				localStorage.setItem("auth", JSON.stringify(data));

				// Close panel
				chrome.windows.getCurrent({}, function (i)
				{
					chrome.windows.remove(i.id);
				});
			},
			error: function (data)
			{
				console.log(data);
				switch(data.responseJSON.code)
				{
					case 401:
						updateError("Ces identifiants ne sont pas valides", true);
					break;
				}
			}
		});
	}
}


/* Update error */

function updateError (message, state)
{
	// Update error state
	if(state){ $('p.error').addClass('active'); }else{ $('p.error').removeClass('active'); }

	// Update error content
	$('p.error').html(message);
}