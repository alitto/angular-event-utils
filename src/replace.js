angular.module('eventUtils')

.directive('evReplace', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			
			// Attach event handlers and stop propagation
			$eventUtils.attachEventHandlerReplacement(elem, scope, attrs.evReplace, true);
		}
	};
}]);