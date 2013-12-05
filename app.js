var express = require('express');
var app = express();

var engine = require('ejs-locals');
 
app.configure(function(){
	app.set('views', __dirname+'/views');
	app.engine('ejs', engine);
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.setHeader("Content-Type", "text/html");
	var data = {
		title: 'Accueil Team not.js',
		layoutFile: 'layout.ejs'
	};
    res.render('index.ejs',data);
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
})

app.listen(process.env.PORT || 5000);