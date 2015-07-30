(function() {
	'use strict';

	var bookBankControllers = angular.module('bookBankControllers', [
		'bookBankServices',
		'ui.router'
	]);

	bookBankControllers
	.controller('HomeCtrl', ['$scope', '$window', 'Auth', function($scope, $window, Auth) {
		$scope.user = {};
		$scope.rUser = {};
		$scope.homeModalTemplate = 'static/partials/login.html';
		$scope.changeTo = function(sPage) {
			if (sPage === "login") {
				$scope.homeModalTemplate = 'static/partials/login.html';
				return;
			}
			$scope.homeModalTemplate = 'static/partials/register.html';
			return;
		};
		$scope.login = function() {
			$scope.$emit('working', true);
			var msg = Auth.post({new: 'new'}, $scope.user, function() {
				if (!msg.err) {
					$scope.$emit('working', false);
					$scope.$emit('loginCompleted');
					return;
				}
				$window.alert(msg.err);
			});
		};
		$scope.register = function() {
			if (!$scope.rUser.name) {
				angular.element('#name').focus();
				$window.alert('이름을 입력해야 합니다.');
				return;
			}
			if (!$scope.rUser.email || !validator.isEmail($scope.rUser.email)) {
				var msg = '유효한 이메일 형식이 아닙니다.';
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
			var msg = Auth.save(null, $scope.rUser, function() {
				if (!msg.err) {
					$window.alert('가입 되었습니다.');
					$scope.changeTo('login');
					return;
				}
				$window.alert(msg.err);
			});
		}
	}])
	.controller('NavbarCtrl', ['$scope', '$state','Books', 'Auth', function($scope, $state, Books, Auth) {
		$scope.bookSearchQuery = {};
		$scope.isWorking = false;
		$scope.loginFlag = false;
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
	.controller('BooksCtrl', ['$scope', '$window', 'Books', 'Reply', 'ParseDate', function($scope, $window, Books, Reply, ParseDate) {
		$scope.$parent.selected = 'books';
		$scope.books = [];
		$scope.books = Books.query();
		$scope.bookTemplate = "";
		$scope.isWorking = false;
		$scope.parseDate = ParseDate;
		$scope.openModal = function(book) {
			$scope.$parent.overflow = 'overflow-hidden';
			$scope.book = {};
			$scope.book.selector = book.selector.name;
			$scope.book._id = book._id;
			$scope.book.title = book.title;
			$scope.book.writer = book.writer;
			$scope.book.publisher = book.publisher;
			$scope.book.info_link = book.info_link;
			$scope.book.img_path = book.img_path.slice(0, book.img_path.lastIndexOf('?'));
			$scope.bookTemplate = 'static/partials/book.html';
			//$window.history.pushState('', 'book', 'books/' + book._id);
			$scope.reply = {};
			getReplies();
		};
		$scope.closeModal = function() {
			$scope.$parent.overflow = '';
			$scope.bookTemplate = '';
			$scope.reply = {};
		};
		$scope.createReply = function() {
			$scope.isWorking = true;
			$scope.reply.created_time = new Date().toISOString(); 
			$scope.reply.edited_time = new Date().toISOString(); 
			Reply.save({bookId: $scope.book._id, flag: 'new'}, $scope.reply, function() {
				$window.alert('등록이 완료 되었습니다.');
				$scope.reply = {};
				$scope.isWorking = false;
				getReplies();
			});
		};
		var getReplies = function() {
			Reply.query({bookId: $scope.book._id}, function(aReplies) {
				$scope.replies = aReplies;
			});
		};
		$scope.$on('bookSearchCompletion', function(e, aBooks) {
			$scope.books = aBooks;
		});
	}])
	.controller('CreateBookCtrl', ['$scope', '$window', 'Book', function($scope, $window, Book) {
		$scope.$parent.selected = 'bookNew';
		$scope.book = {};
		$scope.isWorking = false;
		$scope.$watch('book', function(oBook) {
			if (oBook.title && oBook.semester) {
				$scope.book.flag = true;
			} else {
				$scope.book.flag = false;
			}
		}, true);
		$scope.createBook = function() {
			$scope.isWorking = true;
			Book.save({bookId: 'new'}, $scope.book, function() {
				$window.alert('등록이 완료 되었습니다.');
				$scope.book = {};
				$scope.query = "";
				$scope.isWorking = false;
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
			$scope.book.title = oBook.title;
			$scope.book.writer = oBook.writer;
			$scope.book.publisher = oBook.publisher;
			$scope.book.img_path = oBook.imgPath;
			$scope.book.info_link = oBook.infoLink;
		};
	}]);	
})();
