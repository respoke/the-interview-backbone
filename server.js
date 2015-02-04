var express		= require('express');
var app			= express();
var bodyParser	= require('body-parser');
var Respoke		= require('respoke-admin');
var https 		= require('https');
var http 		= require('http');
var fs 			= require('fs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

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
			appId: '63c52041-5e91-456b-b450-48926feb3964',
			'App-Secret': '679d4baf-7000-4e29-903e-23a825dc9e69'
		});
		
		respoke.auth.endpoint({
			endpointId: endpointId, // The endpointId is the username entered by your app's end user
			roleId: '1816CCA4-2E30-4B64-8FBC-F8E9D7AC7A36' // The roleId is the Id of endpoint role you created for permissions
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
http.createServer(app).listen(8080);
https.createServer(options, app).listen(443);

/*app.listen(port, function(err){
	if (err) {
		console.log('Error binding to port %s, listen error: %s', port, err);
		return;
	}
	
	console.log('Listening on port %s', port);
});*/
