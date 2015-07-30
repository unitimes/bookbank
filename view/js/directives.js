(function() {
	'use strict';

	var bookBankDirectives = angular.module('bookBankDirectives', []);
	
	bookBankDirectives
	.directive('ngCobDisableChecker', function() {
		function link(scope, element, attr) {
			scope.$watch(attr.ngCobAttrFlag, function(flag) {
				if (flag) {
					element.removeAttr('disabled');
				} else {
					element.attr('disabled', true);
				}
			});
		}
		return {
			link: link
		};
	});
})();
