var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var express     = require('express');
var app         = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var port = process.env.PORT || 8080; 
app.use(express.static(__dirname + '/public'));

var patentLink = 'http://www.freepatentsonline.com/';




app.get('/', function(req, res, next) {
	res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

app.post('/patFetch', function(req, res) {
	var url = patentLink + req.body.num + '.html';
	request(url, function(error, response, html) {
		if(!error) {
			res.json({html: html});
		
		}
	});
	
});




app.listen(port);
console.log('Server started on port: ' + port);




