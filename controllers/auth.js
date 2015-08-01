var express = require('express'),
	validator = require('validator'),
	msg = require('../enum/msg'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	user = require('../models/user');

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
		if (oUser.password !== req.body.password) {
			err.sendKey = 'wrongPassword';
			next(err);
			return;
		}
			//return res.status(200).json( { 'err': msg.errors.noUser });
		//if (user.password !== req.body.password)
			//return res.status(200).json( { 'err': msg.errors.wrongPassword });
		req.session.user.id = oUser._id;
		req.session.user.name = oUser.name;
		res.sendStatus(200);
	});
});
router.post('/', bodyParser.json(), function(req, res, next) {
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
