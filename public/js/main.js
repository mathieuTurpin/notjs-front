$(document).ready(function(){
	var ws;
	var myFbId;
	var myName;
	var myUserId;

	var initWS = function(){
		ws.onopen = function()
		{
        	// Web Socket is connected, send data using send()
        	var toSend = JSON.stringify(getUserByFb());
        	console.log(toSend);

        	ws.send(toSend);

        	$("#venteForm").submit(function()
			{
				var nomProd = $("#nomProd").val();
				var prixProd = $("#prixProd").val();
				var descProd = $("#descProd").val();

				var toSend = JSON.stringify(createSale(nomProd,descProd,prixProd));
        		console.log(toSend);
				ws.send(toSend);

				return false;
			});
        };

        ws.onmessage = function (evt)
        {
        	var jsonEvt = JSON.parse(evt.data);
        	console.log(jsonEvt);
        	if(jsonEvt.type == undefined) return;
        	switch(jsonEvt.type){
        		case 'userId':
        			$("#nameUser").html('Bonjour '+myName);
        			console.log("idUser: "+jsonEvt.payload.id);
        			myUserId = jsonEvt.payload.id;
        			break;
        		case 'saleId':
        			console.log("idVente: "+jsonEvt.payload.id);
        			var idVente = jsonEvt.payload.id;

        			//var hostname = window.location.hostname; //for localhost
        			var hostname = window.location.host;
	        		console.log("hostname: "+hostname+"/mesventes");
	        		window.location.href = "http://"+hostname+"/mesventes/"+idVente;
        			break;
        	}

        };
    }


    var getUserByFb = function(){
    	return {'type':'getUserByFb', payload:{'fbid':myFbId,'name':myName}};
    };

    var createSale = function(name,description,price){
    	return {'type':'createSale', payload:{'name':name,'description':description,'price':price,'seller':myUserId}};
    };

    window.fbAsyncInit = function() {
    	FB.init({
    		appId      : '182989121907455',
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});

		// Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
		// for any authentication related change, such as login, logout or session refresh. This means that
		// whenever someone who was previously logged out tries to log in again, the correct case below 
		// will be handled. 
		FB.Event.subscribe('auth.authResponseChange', function(response) {
			// Here we specify what we do with the response anytime this event occurs. 
			if (response.status === 'connected') {
			  // The response object is returned with a status field that lets the app know the current
			  // login status of the person. In this case, we're handling the situation where they 
			  // have logged in to the app.
			  testAPI();
			  $("#facebookLogin").hide();
			} else if (response.status === 'not_authorized') {
			  // In this case, the person is logged into Facebook, but not into the app, so we call
			  // FB.login() to prompt them to do so. 
			  // In real-life usage, you wouldn't want to immediately prompt someone to login 
			  // like this, for two reasons:
			  // (1) JavaScript created popup windows are blocked by most browsers unless they 
			  // result from direct interaction from people using the app (such as a mouse click)
			  // (2) it is a bad experience to be continually prompted to login upon page load.
			  FB.login();
			} else {
			  // In this case, the person is not logged into Facebook, so we call the login() 
			  // function to prompt them to do so. Note that at this stage there is no indication
			  // of whether they are logged into the app. If they aren't then they'll see the Login
			  // dialog right after they log in to Facebook. 
			  // The same caveats as above apply to the FB.login() call here.
			  FB.login();
			}
		});
	};

	// Load the SDK asynchronously
	(function(d){
		var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement('script'); js.id = id; js.async = true;
		js.src = "//connect.facebook.net/fr_FR/all.js";
		ref.parentNode.insertBefore(js, ref);
	}(document));

	// Here we run a very simple test of the Graph API after login is successful. 
	// This testAPI() function is only called in those cases. 
	function testAPI() {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me?fields=id,name', function(response) {
			//Create webSocket to Server
			myFbId = ''+response.id;
			myName = ''+response.name;
			ws = new WebSocket("ws://notjs-back.herokuapp.com");

			initWS();
		});
	}
});