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
			url: '/bookbank/home',
			templateUrl: 'bookbank/static/partials/home.html',
			controller: 'HomeCtrl'
		})
		.state('books', {
			url: '/bookbank/books',
			templateUrl: 'bookbank/static/partials/books.html',
			controller: 'BooksCtrl'
		})
		.state('booksNew', {
			url: '/bookbank/books/new',
			templateUrl: 'bookbank/static/partials/create-book.html',
			controller: 'CreateBookCtrl'
		})
		.state('booksId', {
			url: '/bookbank/books/:id',
			templateUrl: 'bookbank/static/partials/book.html',
			controller: 'BooksIdCtrl'
		});

		$locationProvider.html5Mode(true);
	}]);
})();
