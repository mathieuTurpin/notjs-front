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

				friendLike(nomProd);
				//friendLike("iPhone 5S");
				//friendLike("Ile de La Réunion Tourisme (IRT)");

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

        			var url = ""+window.location.pathname;
					console.log(url);
					var path = url.split("/")[1];
					if(path == "mesventes"){
						var toSend = JSON.stringify(getSalesOfUser(myUserId));
		        		console.log(toSend);
						ws.send(toSend);
					}
        			break;

        		case 'saleId':
        			console.log("idVente: "+jsonEvt.payload.id);
        			var idVente = jsonEvt.payload.id;

        			/*var hostname = window.location.hostname;
        			//var hostname = window.location.host; //for localhost
	        		console.log("hostname: "+hostname+"/mesventes");
	        		window.location.href = "http://"+hostname+"/mesventes/"+idVente;*/
	        		alert("Produit mise en vente");
        			break;
        		case 'sales':
        			console.log("listVente: "+jsonEvt.payload.sales);
        			listVenteToHTML(jsonEvt.payload.sales);
        			break;
        	}

        };
    }

    var listVenteToHTML = function(data){
    	var listVenteHtml = $("#listVente");

		$.each(data,function(index, value){
		    listVenteHtml.append(venteHTML(value.value));
		});
    }

    var venteHTML = function(data){
    	var li = document.createElement('li');
    	var ul = document.createElement('ul');

    	var nomLi = document.createElement('li');
    	nomLi.className= "inline";
		nomLi.innerHTML = "Nom produit: "+data.product;

		var prixLi = document.createElement('li');
		prixLi.className= "inline";
		prixLi.innerHTML = "Prix: "+data.price;

		var dateLi = document.createElement('li');
		dateLi.className= "inline";
		dateLi.innerHTML = "Date :"+data.date;

		var descDiv = document.createElement('div');
		descDiv.innerHTML = "Description: "+data.description;

		$(ul).append(nomLi).append(prixLi).append(dateLi).append(descDiv);
		$(li).append(ul);

		return li;
    }

    var getUserByFb = function(){
    	return {'type':'getUserByFb', payload:{'fbid':myFbId,'name':myName}};
    };

    var createSale = function(name,description,price){
    	return {'type':'createSale', payload:{'name':name,'description':description,'price':price,'seller':myUserId}};
    };

    var getSalesOfUser = function(idUser){
    	return {"type":"getSalesOfUser","payload":{"seller":idUser}}
    };

	FB.init({
		appId      : '182989121907455',
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});

	LoginFB();

	function LoginFB(){
		FB.login(function(response) {
			  if (response.authResponse) {
			    testAPI();
			  } else {
			    console.log('User cancelled login or did not fully authorize.');
			  }
			}, {scope:'user_friends,friends_likes'}
		);
	}

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

	function friendLike(likeName){
		console.log("Search friend like: "+likeName);
		FB.api('/me?fields=friends.limit(10).fields(likes.fields(name),name)', function(response){
			$.each(response.friends.data,function(index, value){
				test(value,likeName);
			});
			//Search in nextListFriends
			if(response.friends.paging != undefined && response.friends.paging.next != undefined){
				searchNextListFriends(response.friends.paging.next,likeName);
			}
		});
	}

	function searchNextListFriends(urlNext,likeName){
		var urlNext = ''+urlNext;
		var url = urlNext.split('https://graph.facebook.com');
		FB.api(url[1], function(response){
			$.each(response.data,function(index, value){
				test(value,likeName);
			});

			//Search in nextListLike
			if(response.paging != undefined && response.paging.next != undefined){
				searchNextListFriends(response.paging.next,likeName);
			}
		});
	}

	function test(value,likeName){
		//Have like
		var nameFriend = value.name;
		if(value.likes !== undefined){
			$.each(value.likes.data,function(i, val){
				if(val.name == likeName){
					var li = document.createElement('li');
					li.innerHTML = nameFriend;
					$("#result").append(li);

					console.log("FriendName like this product: "+nameFriend);
				}
			});

			//Search in nextListLike
			if(value.likes.paging != undefined && value.likes.paging.next != undefined){
				searchNextListLike(value.likes.paging.next,likeName,nameFriend);
			}
		}
	}

	function searchNextListLike(urlNext,likeName,nameFriend){
		var urlNext = ''+urlNext;
		var url = urlNext.split('https://graph.facebook.com');
		FB.api(url[1], function(response){
			$.each(response.data,function(index, value){
				if(value.name == likeName){
					var li = document.createElement('li');
					li.innerHTML = nameFriend;
					$("#result").append(li);

					console.log("FriendName like this product: "+nameFriend);
				}							
			});
			if(response.paging != undefined && response.paging.next != undefined){
				searchNextListLike(response.paging.next,likeName,nameFriend);
			}
		});
	}
});