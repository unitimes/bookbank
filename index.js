var express = require('express'),
	session = require('express-session'),
	favicon = require('serve-favicon'),
	MongoStore = require('connect-mongo')(session),
	mongoose = require('./support/db-connector.js'),
	db = mongoose.connection,
	app = express(),
	winston = require('winston');

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.File)({ 
			filename: 'bookbank.log',
			lever: 'error'
		})
	]
});
logger.exitOnError = false;
process.on('uncaughtException', function (err) {
	console.log('Exception occured: ' + err.stack);
	logger.log('error', err.stack);
});
app.use('/bookbank', session({
	secret: 'book-bank app',
	saveUninitialized: false,
	resave: false,
	store: new MongoStore({ mongooseConnection: db })
}));
app.use('/bookbank', favicon(__dirname + '/favicon.ico'));
app.use('/bookbank/static', express.static(__dirname + '/view'));
app.use('/bookbank', require('./controllers'));

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
	console.log('connected');
	var server = app.listen(3000, function() {
		console.log('Express server is listening on port %d', server.address().port);
	});
});
