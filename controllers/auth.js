var express = require('express'),
	validator = require('validator'),
	msg = require('../enum/msg'),
	router = express.Router(),
	crypto = require('crypto'),
	bodyParser = require('body-parser'),
	user = require('../models/user');

var makeHash = function(data) {
	var shasum = crypto.createHash('sha512');
	shasum.update(data, 'utf8');
	return shasum.digest('base64');
};

router.delete('/', function(req, res, next) {
	req.session.user = {};
	res.sendStatus(200);
});
router.post('/new', bodyParser.json(), function(req, res, next) {
	if (!req.body.email)
		return res.status(200).json({ err: msg.errors.emptyEmail });
	if (!validator.isEmail(req.body.email))
		return res.status(200).json({ err: msg.errors.nonvalEmail });

	user.getByEmail(req.body.email, function(err, user) {
		if (err) {
			next(err);
			return;
		}
		err = {};
		if (!user || user.length === 0) {
			err.sendKey = 'noUser';
			next(err);
			return;
		}
		var oUser = user[0].toObject();
		var hashedPassword = makeHash(req.body.password);
		if (oUser.password !== hashedPassword) {
			err.sendKey = 'wrongPassword';
			next(err);
			return;
		}
		req.session.user.id = oUser._id;
		req.session.user.name = oUser.name;
		res.cookie('user', req.session.user);
		res.sendStatus(200);
	});
});
router.post('/', bodyParser.json(), function(req, res, next) {
	req.body.password = makeHash(req.body.password);
	user.create(req.body, function(err, user) {
		if (err && err.code === 11000) {
			err.sendKey = 'dupEmail';
			next(err);
			return;
		}
		if (err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});

module.exports = router;
