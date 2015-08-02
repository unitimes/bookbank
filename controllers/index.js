var express = require('express'),
	msg = require('../enum/msg'),
	router = express.Router();

router.use(function(req, res, next) {
	req.session.user = req.session.user || {};
	next();
});
router.use(function(req, res, next) {
	if (req.xhr) {
		next();
		return;
	}
	if (req.session.user.id && req.baseUrl !== '/books' && req.url !== '/books') {
		res.redirect('/bookbank/books');
		return;
	}
	if (!req.session.user.id && req.baseUrl !== '/home' && req.url !== '/home') {
		res.redirect('/bookbank/home');
		return;
	}
	next();
}, function(req, res, next) {
	if (!req.xhr) {
		next();
		return;
	}
	if (!req.session.user.id && 
			req.baseUrl !== '/home' && req.url !== '/home' && 
				req.baseUrl !== '/auth' && req.url !== '/auth' &&
					req.baseUrl !== '/auth/new' && req.url !== '/auth/new') {
		res.redirect('/home');
	return;
	}
	next();
});
router.use(function(req, res, next) {
	if (req.xhr) {
		res.append('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.append('Pragma', 'no-cache');
		res.append('Expires', '0');
	}
	next();
});

router.use('/home', require('./home'));
router.use('/books', require('./books'));
router.use('/auth', require('./auth'));

router.use(function(err, req, res, next) {
	if (msg.errors[err.sendKey]) {
		res.status(200).json({ err: msg.errors[err.sendKey] });
		return;
	}
});

module.exports = router;
