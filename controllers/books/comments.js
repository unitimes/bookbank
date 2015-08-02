var express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	comment = require('../../models/comment');

router.put('/', bodyParser.json(), function(req, res, nest) {
	var oComment = req.body;
	oComment.selector = {};
	oComment.selector._id = req.session.user.id;
	oComment.selector.name = req.session.user.name;
	comment.update(oComment, function(err) {
		if (err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});

router.get('/', function(req, res, next) {
	comment.getByBookId(req.bookId, function(err, comment) {
		if (err) {
			next(err);
			return;
		}
		res.status(200).send(comment);
	});
});

router.post('/new', bodyParser.json(), function(req, res, next) {
	var oComment = req.body;
	oComment.selector = {};
	oComment.selector._id = req.session.user.id;
	oComment.selector.name = req.session.user.name;
	comment.create(oComment, function(err) {
		if (err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});

router.delete('/:id', function(req, res, next) {
	comment.remove(req.params.id, function(err) {
		if (err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});

module.exports = router;
