var express		= require('express');
var app			= express();
var bodyParser	= require('body-parser');
var Respoke		= require('respoke-admin');
var https 		= require('https');
var http 		= require('http');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// API Routes
var router = express.Router();

// Create a token (accessed at POST /api/tokens)
router.route('/tokens')
	
	.post(function(req, res) {
		//console.log(req);
		var endpointId = req.body.endpointId;
		
		console.log('Create new token using the Respoke API');
		
		console.log('POST /tokens endpointId: ', endpointId);
		
		// Consider putting credentials like appId and appSecret into a configuration file
		var respoke = new Respoke({
			appId: process.env.APP_ID,
			'App-Secret': process.env.APP_SECRET
		});
		
		respoke.auth.endpoint({
			endpointId: endpointId, // The endpointId is the username entered by your app's end user
			roleId: process.env.ROLE_ID // The roleId is the Id of endpoint role you created for permissions
		}, function (err, response) {
			if (err) {
				console.log('respoke.auth.endpoint', err);
				err.status = 500;
			}

			if (!response || !response.tokenId) {
				res.json(err);
			} else {
				res.json({
					token: response.tokenId
				});
			}
		 });
	});

// Register our routes
app.use('/api', router);

app.use(express.static(__dirname + '/app'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// Start the server
http.createServer(app).listen(port);

if(process.env.NODE_ENV === "development") {
	var fs = require('fs');
	
	var options = {
	  key: fs.readFileSync('./key.pem'),
	  cert: fs.readFileSync('./cert.pem')
	};
	
	https.createServer(options, app).listen(443);
}



