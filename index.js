var express = require('express'),
	session = require('express-session'),
	favicon = require('serve-favicon'),
	MongoStore = require('connect-mongo')(session),
	mongoose = require('./support/db-connector.js'),
	db = mongoose.connection,
	app = express();

app.use(session({
	secret: 'book-bank app',
	saveUninitialized: false,
	resave: false,
	store: new MongoStore({ mongooseConnection: db })
}));
app.use(favicon(__dirname + '/favicon.ico'));
app.use('/static', express.static(__dirname + '/view'));
app.use(require('./controllers'));

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
	console.log('connected');
	var server = app.listen(3000, function() {
		console.log('Express server is listening on port %d', server.address().port);
	});
});
