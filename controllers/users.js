var express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	user = require('../models/user');

router.post('/new', function(req, res, next) {
	user.create(req.body, function(err) {
		if (err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});
