try {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; //Disables HTTPS / SSL / TLS checking across entire node.js environment.

	/**
	 * import modules
	 */
	var express = require('express');
	var session = require('express-session');
	var bodyParser = require('body-parser');
	var methodOverride = require('method-override');

	/**
	 * set global variables
	 */
	global._path =
		{
			home: __dirname,
			controller: __dirname + '/controller',
			views: __dirname + '/views',
			libs: __dirname + '/libs',
			files: __dirname + '/tmp'
		};

	var fs = require('fs');
	try {
		if(!fs.existsSync(_path.files))
	  		fs.mkdirSync(_path.files, 0777);
	} catch (error) {
		console.log(error.stack);
	}


	/**
	 * create express and imp
	 */
	var app = global._app = express();
	var server = app.listen(process.env.PORT || 3000, function () {
		console.log('Listening on port %d', server.address().port);
	});
	var io = require('socket.io').listen(server);

	var imp = require('nodejs-imp');
	imp.setPattern(_path.home + '/views/html/{{name}}.html');

	var Renderer = require(_path.libs + '/Renderer');
	imp.addRenderModule(Renderer.replacePath);

	/**
	 * set static dirs
	 */
	app.use('/views', express.static(_path.views));

	/**
	 * set middleware
	 */
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(imp.render);
	app.use(session({
		secret: 'swift',
		resave: false,
		saveUninitialized: true,
		cookie: { 
	        expires: new Date(Date.now() + 180 * 10000), 
	        maxAge: 180*10000
	    }
	}));

	app.use(function(req, res, next){
		if(!req.session)
			req.session = {};

			next();
	});

	/**
	 * error handling
	 */
	app.use(function (err, req, res, next) {
		console.error('=================================================');
		console.error('time : ' + new Date().toString());
		console.error('name : Exception');
		console.error('-------------------------------------------------');
		console.error(err.stack);
		console.error('=================================================');

		res.statusCode = 500;
		res.send(err.stack);
	});

	process.on('uncaughtException', function (err) {
		console.error('\n\n');
		console.error('=================================================');
		console.error('time : ' + new Date().toString());
		console.error('name : UncaughtException');
		console.error('-------------------------------------------------');
		console.error(err.stack);
		console.error('=================================================\n\n');
	});

	var router = require(_path.controller + '/router/MainRouter')(app, io);
	// var moduleLoader = require(_path.libs + '/ModuleLoader');
	// moduleLoader(app);
} catch (error) {
	console.log(error);
}