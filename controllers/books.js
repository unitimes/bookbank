var express = require('express'),
	router = express.Router(),
	bodyParser = require('body-parser'),
	book = require('../models/book'),
	reply = require('../models/reply.js'),
	path = require('path'),
	bookScraper = require('../services/book-scraper');

router.get('/', function(req, res, next) {
	if (!req.xhr) {
		res.sendFile(path.join(__dirname, '../view/app.html'));
		return;
	}
	next();
});
router.get('/', function(req, res, next) {
	var aKeywords,
	semester,
	fCallback = function(err, aBooks) {
		if(err) {
			next(err);
			return;
		}
		res.status(200).send(aBooks);
		return;
	};

	if (req.query.keywords) {
		aKeywords = req.query.keywords.split(' ');
		aKeywords.forEach(function(keyword, idx, array) {
			array[idx] = new RegExp("\\w*" + keyword + "\\w*");
		});
	}
	if (req.query.semester)
		semester = req.query.semester;

	//when there isn't any query
	if (!semester && !aKeywords) {
		book.getAll(fCallback);
		return;
	}
	//when there are both keywords and semester
	if (semester && aKeywords) {
		book.getByKeywordsSemester(aKeywords, semester, fCallback);
		return;
	}
	//when there is only semester
	if (semester) {
		book.getBySemester(semester, fCallback);
		return;
	}
	//when there are only keywords
	if (aKeywords) {
		book.getByKeywords(aKeywords, fCallback);
		return;
	}
});
router.post('/new', bodyParser.json(), function(req, res, next) {
	req.body.selector = {};
	req.body.selector._id = req.session.user.id;
	req.body.selector.name = req.session.user.name;
	book.create(req.body, function(err) {
		if (err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});
router.get('/new', function(req, res) {
	res.redirect('/#/books/new');
});
router.get('/search', function(req, res) {
	var query = req.query.query;
	var arrQuery = query.split(' ');
	bookScraper.getBooksObjOnNaver(arrQuery, req.query.pageNumber).then(function(oBooks) {
		res.status(200).send(oBooks);
	});
});
router.get('/:id', function(req, res, next) {
	book.getById(req.params.id, function(err, book) {
		if (err) {
			next(err);
			return;
		}
		res.status(200).send(book);
	});
});
router.delete('/:id', function(req, res, next) {
	book.remove(req.params.id, function(err) {
		if(err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});
router.post('/:id/replies/new', bodyParser.json(), function(req, res, next) {
	var oReply = req.body;
	oReply.book_id = req.params.id;
	oReply.replier = {};
	oReply.replier._id = req.session.user.id;
	oReply.replier.name = req.session.user.name;
	reply.create(oReply, function(err) {
		if (err) { next(err); }
		res.sendStatus(200);
	});
});
router.delete('/:id/replies/:replyId', function(req, res, next) {
	reply.remove(req.params.replyId, function(err) {
		if (err) {
			next(err);
			return;
		}
		res.sendStatus(200);
	});
});
router.get('/:id/replies', function(req, res, next) {
	reply.findByBookId(req.params.id, function(err, aReplies) {
		if (err) {
			next(err);
			return;
		}
		res.status(200).send(aReplies);
	});
});

router.use('/:id/comments', function(req, res, next) {
	req.bookId = req.params.id;
	next();
}, require('./books/comments'));

module.exports = router;
