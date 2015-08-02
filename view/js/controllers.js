(function() {
	'use strict';

	var bookBankControllers = angular.module('bookBankControllers', [
		'bookBankServices',
		'ngCookies',
		'ui.router'
	]);

	bookBankControllers
	.controller('HomeCtrl', ['$scope', '$window', 'Auth', function($scope, $window, Auth) {
		$scope.user = {};
		$scope.rUser = {};
		$scope.homeModalTemplate = 'bookbank/static/partials/login.html';
		$scope.changeTo = function(sPage) {
			if (sPage === "login") {
				$scope.homeModalTemplate = 'bookbank/static/partials/login.html';
				return;
			}
			$scope.homeModalTemplate = 'bookbank/static/partials/register.html';
			return;
		};
		$scope.login = function() {
			$scope.$emit('working', true);
			var msg = Auth.post({new: 'new'}, $scope.user, function() {
				if (msg.err)
					$window.alert(msg.err);
				if (!msg.err) {
					$scope.$emit('loginCompleted');
				}
				$scope.$emit('working', false);
			});
		};
		$scope.register = function() {
			var msg;
			if (!$scope.rUser.name) {
				angular.element('#name').focus();
				$window.alert('이름을 입력해야 합니다.');
				return;
			}
			if (!$scope.rUser.email || !validator.isEmail($scope.rUser.email)) {
				msg = '유효한 이메일 형식이 아닙니다.';
				angular.element('#email').focus();
				if (!$scope.rUser.email)
					msg = '메일 주소를 입력해야 합니다.';
				$window.alert(msg);
				return;
			}
			if (!$scope.rUser.password) {
				angular.element('#password').focus();
				$window.alert('비밀번호를 입력해야 합니다.');
				return;
			}
			if ($scope.rUser.password !== $scope.rUser.confirmPassword) {
				angular.element('#confirm-password').focus();
				$window.alert('비밀번호가 일치하지 않습니다.');
				return;
			}
			msg = Auth.save(null, $scope.rUser, function() {
				if (!msg.err) {
					$window.alert('가입 되었습니다.');
					$scope.changeTo('login');
					return;
				}
				$window.alert(msg.err);
			});
		};
	}])
	.controller('NavbarCtrl', ['$scope', '$state', '$cookies', 'Books', 'Auth', function($scope, $state, $cookies, Books, Auth) {
		$scope.bookSearchQuery = {};
		$scope.isWorking = false;
		$scope.loginFlag = $cookies.get('user');
		$scope.toggleActive = function(sState) {
			$scope.selected = sState;
		};
		$scope.isSelected = function(sState) {
			return $scope.selected === sState;
		};
		$scope.searchBooks = function() {
			Books.query({keywords: $scope.bookSearchQuery.keywords, semester: $scope.bookSearchQuery.semester}, 
									function(aBooks) {
										$scope.$broadcast('bookSearchCompletion', aBooks);
									});
		};
		$scope.$on('working', function(ev, flag) {
			$scope.isWorking = flag;
		});
		$scope.$on('loginCompleted', function() {
			$scope.loginFlag = true;
			$state.go('books');
		});
		$scope.logout = function() {
			var msg = Auth.delete(function() {
				if (!msg.err) {
					$state.go('home');
					$scope.loginFlag = false;
				}
			});
		};
	}])
	.controller('BooksCtrl', ['$scope', '$window', '$cookies', 'Books', 'Book', 'Comment', 'Reply', 'ParseDate', function($scope, $window, $cookies, Books, Book, Comment, Reply, ParseDate) {
		//ui router state change
		$scope.$parent.selected = 'books';
		$scope.books = Books.query();
		$scope.bookTemplate = "";
		$scope.parseDate = ParseDate;
		$scope.oUser = JSON.parse($cookies.get('user').slice(2));
		$scope.openModal = function(book) {
			initModalModel();
			copyBookToModalModel(book);
			getComment();
			getReplies();
			$scope.bookTemplate = 'bookbank/static/partials/book.html';
		};
		var initModalModel = function() {
			$scope.commentFlag = false;
			$scope.commentEditFlag = false;
			$scope.$parent.overflow = 'overflow-hidden';
			$scope.book = {};
			$scope.replies = {};
			$scope.comment = {};
			$scope.reply = {};
		};
		var copyBookToModalModel = function(book) {
			$scope.book.selector = book.selector;
			$scope.book.created_time = $scope.parseDate(book.created_time);
			$scope.book._id = book._id;
			$scope.book.title = book.title;
			$scope.book.writer = book.writer;
			$scope.book.publisher = book.publisher;
			$scope.book.info_link = book.info_link;
			$scope.book.img_path = book.img_path.slice(0, book.img_path.lastIndexOf('?'));
		};
		var getComment = function() {
			$scope.comment = {};
			Comment.get({ 'bookId': $scope.book._id }, function(comment) {
				if (comment.content) {
					$scope.commentFlag = true;
					$scope.comment = comment;
					return;
				}
				$scope.commentFlag = false;
			});
		};
		$scope.createComment = function() {
			$scope.comment.related_book = {};
			$scope.comment.related_book._id = $scope.book._id;
			$scope.comment.related_book.title = $scope.book.title;
			var successor = function() {
				$window.alert('등록이 완료 되었습니다.');
				$scope.commentEditFlag = false;
				getComment();
			};
			if (!$scope.commentFlag) {
				Comment.save({ 'bookId': $scope.book._id, 'flag': 'new' }, $scope.comment, successor);
				return;
			}
			Comment.update({ 'bookId': $scope.book._id, }, $scope.comment, successor);
		};
		$scope.openCommentEditor = function() {
			$scope.commentEditFlag = true;
		};
		$scope.closeModal = function() {
			$scope.$parent.overflow = '';
			$scope.bookTemplate = '';
			$scope.reply = {};
		};
		$scope.createReply = function() {
			$scope.reply.created_time = new Date().toISOString(); 
			$scope.reply.edited_time = new Date().toISOString(); 
			Reply.save({bookId: $scope.book._id, flag: 'new'}, $scope.reply, function() {
				$window.alert('등록이 완료 되었습니다.');
				$scope.reply = {};
				getReplies();
			});
		};
		var getReplies = function() {
			$scope.replies = {};
			Reply.query({bookId: $scope.book._id}, function(aReplies) {
				$scope.replies = aReplies;
			});
		};
		$scope.$on('bookSearchCompletion', function(e, aBooks) {
			$scope.books = aBooks;
		});
		$scope.deleteBook = function(book) {
			var deleteFlag = $window.confirm('삭제하시겠습니까?');
			if (deleteFlag) {
				$scope.$emit('working', true);
				Book.delete({ "bookId": book._id }, function() {
					var idx = $scope.books.indexOf(book);
					$window.alert('삭제되었습니다.');
					$scope.books.splice(idx, 1);
					$scope.$emit('working', false);
				});
			}
		};
		$scope.deleteComment = function(comment) {
			var deleteFlag = $window.confirm('삭제하시겠습까?');
			if (deleteFlag) {
				$scope.$emit('working', true);
				Comment.delete({ "bookId": $scope.book._id, "flag": comment._id }, function() {
					$window.alert('삭제되었습니다.');
					getComment();
					$scope.$emit('working', false);
				});
			}
		};
		$scope.deleteReply = function(book, reply) {
			var deleteFlag = $window.confirm('삭제하시겠습까?');
			if (deleteFlag) {
				$scope.$emit('working', true);
				Reply.delete({ "bookId": book._id, "flag": reply._id }, function() {
					var idx = $scope.replies.indexOf(reply);
					$window.alert('삭제되었습니다.');
					$scope.replies.splice(idx, 1);
					$scope.$emit('working', false);
				});
			}
		};
	}])
	.controller('CreateBookCtrl', ['$scope', '$window', '$state', 'Book', function($scope, $window, $state, Book) {
		$scope.createBoxFlag = false;
		$scope.$parent.selected = 'bookNew';
		$scope.book = {};
		$scope.$watch('book', function(oBook) {
			if (oBook.title && oBook.semester) {
				$scope.book.flag = true;
			} else {
				$scope.book.flag = false;
			}
		}, true);
		$scope.createBook = function() {
			$scope.book.created_time = new Date().toISOString();
			Book.save({bookId: 'new'}, $scope.book, function() {
				$window.alert('등록이 완료 되었습니다.');
				$scope.book = {};
				$scope.query = "";
				$state.go('books');
			});
		};
		$scope.searchBooks = function() {
			$scope.oSearchedBooks =	Book.get({bookId: 'search', query: $scope.query, pageNumber: 1});
		};
		$scope.searchNextPage = function() {
			Book.get({bookId: 'search', query: $scope.oSearchedBooks.arrKeywords.join(' '), pageNumber: parseInt($scope.oSearchedBooks.curPageNum) + 1}, function(oBooks) {
				$scope.oSearchedBooks.moreBooksFlag = oBooks.moreBooksFlag;
				$scope.oSearchedBooks.curPageNum = oBooks.curPageNum;
				$scope.oSearchedBooks.aBooks = $scope.oSearchedBooks.aBooks.concat(oBooks.aBooks);
			});
		};
		$scope.fillInputs = function(oBook) {
			$scope.createBoxFlag = true;
			$scope.book.title = oBook.title;
			$scope.book.writer = oBook.writer;
			$scope.book.publisher = oBook.publisher;
			$scope.book.img_path = oBook.imgPath;
			$scope.book.info_link = oBook.infoLink;
		};
	}]);	
})();
