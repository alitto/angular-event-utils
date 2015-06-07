angular.module('eventUtils')

.directive('evAs', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			
			// Listen to events and re-emit them with a different name
			$eventUtils.attachEventHandlerReplacement(elem, scope, attrs.evAs, false);
		}
	};
}]);