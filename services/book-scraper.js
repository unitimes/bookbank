(function() {
	'use strict';

	var request = require('request'),
		cheerio = require('cheerio');

	if (!String.prototype.includes) {
		String.prototype.includes = function() {
			return String.prototype.indexOf.apply(this, arguments) !== -1;
		};
	}

	var getBooksObjOnNaver;

	(function() {
		var $;
		var BOOK_NUM_PER_PAGE = 20;

		var parseBody = function(oBooks, pageNumber, arrKeywords) {
			setBooksProperty(oBooks, pageNumber, arrKeywords);
			insertBooks(oBooks);
		};

		var setBooksProperty = function(oBooks, pageNumber, arrKeywords) {
			oBooks.moreBooksFlag = hasMoreBooks(pageNumber);
			oBooks.curPageNum = pageNumber;
			oBooks.arrKeywords = arrKeywords;
		};

		var hasMoreBooks = function(pageNumber) {
			var sTotalBooks = $('.num.num2').children().text();
			var nTotalBooks = parseInt(sTotalBooks.slice(0, sTotalBooks.length - 1));
			return nTotalBooks > BOOK_NUM_PER_PAGE * pageNumber;
		};

		var setBookProperty = function(elem, oBook) {
			var jqData = $(elem);
			if (jqData.attr('class').includes('author')) {
				oBook.writer = jqData.text();
				return;
			}
			if (jqData.attr('class').includes('publisher')) {
				oBook.publisher = jqData.text();
				return;
			}
			return;
		};

		var insertBooks = function(oBooks) {
			$('#searchBiblioList>li').filter(function() {
				var oBook = {};
				var data = $(this);
				oBook.title = data.find('dl>dt>a').text();
				oBook.infoLink = data.find('dl>dt>a').attr('href');
				oBook.imgPath = data.find('.thumb_type>a>img').attr('src');
				data.find('dl>dd>a').filter(function() {
					setBookProperty(this, oBook);
				});
				oBooks.aBooks.push(oBook);
			});

		};

		var makeQuery = function(arrKeywords) {
			var query = arrKeywords[0];
			arrKeywords.forEach(function(elem, index) {
				if (index === 0)
					return;
				query += '+' + elem;
			});
			return query;
		};

		var getBody = function(url) {
			console.log(url);
			var promise = new Promise(function(resolve, reject) {
				request.get(url, function(err, resp, body) {
					if (err)
						throw err;
					$ = cheerio.load(body);
					resolve();
				});
			});
			return promise;
		};

		var makeUrlForNaverBooks = function(arrKeywords, pageNumber) {
			var query = makeQuery(arrKeywords);
			return 'http://book.naver.com/search/search_in.nhn?query=' + encodeURIComponent(query) + '&&pattern=0&orderType=rel.desc&viewType=list&searchType=bookSearch&serviceSm=service.basic&title=&author=&publisher=&isbn=&toc=&subject=&publishStartDay=&publishEndDay=&categoryId=&qdt=1&filterType=0&filterValue=&serviceIc=service.author&buyAllow=0&ebook=0&page=' + pageNumber;
		};

		getBooksObjOnNaver = function(arrKeywords, pageNumber) {
			var promise = new Promise(function(resolve, reject) {
				var oBooks = {};
				oBooks.aBooks = [];
				getBody(makeUrlForNaverBooks(arrKeywords, pageNumber)).then(function() {
					parseBody(oBooks, pageNumber, arrKeywords);
					resolve(oBooks);
				});
			});
			return promise;
		};
	})();
	exports.getBooksObjOnNaver = getBooksObjOnNaver;
})();
