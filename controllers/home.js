var express = require('express'),
	path = require('path'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	user = require('../models/user.js');

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../view', 'app.html'));
});

module.exports = router;
