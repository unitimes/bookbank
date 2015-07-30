(function() {
	'use strict';

	var bookBank = angular.module('bookBank', [
		'ui.router',
		'bookBankControllers',
		'bookBankServices',
		'bookBankDirectives'
	]);

	bookBank
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
	}])
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
		$urlRouterProvider.otherwise('/home');
		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: 'static/partials/home.html',
			controller: 'HomeCtrl'
		})
		.state('books', {
			url: '/books',
			templateUrl: 'static/partials/books.html',
			controller: 'BooksCtrl'
		})
		.state('booksNew', {
			url: '/books/new',
			templateUrl: 'static/partials/create-book.html',
			controller: 'CreateBookCtrl'
		})
		.state('booksId', {
			url: '/books/:id',
			templateUrl: 'static/partials/book.html',
			controller: 'BooksIdCtrl'
		});

		$locationProvider.html5Mode(true);
	}]);
})();
