(function() {
	'use strict';

	var bookBankServices = angular.module('bookBankServices', [
		'ngResource'
	]);

	bookBankServices
	.factory('ParseDate', [function() {
		return function(sIso) { return new Date(sIso).toLocaleString(); };
	}])
	.factory('Auth', ['$resource', function($resource) {
		return $resource('bookbank/auth/:new', null, { 'post': { method: 'POST' }});
	}])
	.factory('Comment', ['$resource', function($resource) {
		return $resource('bookbank/books/:bookId/comments/:flag', null , { 'update': { method: 'PUT' }});
	}])
	.factory('Reply', ['$resource', function($resource) {
		return $resource('bookbank/books/:bookId/replies/:flag');
	}])
	.factory('Book', ['$resource', function($resource) {
		return $resource('bookbank/books/:bookId');
	}])
	.factory('Books', ['$resource', function($resource) {
		return $resource('bookbank/books');
	}]);
})();
