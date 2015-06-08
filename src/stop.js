angular.module('eventUtils')

.directive('evStop', ['$eventUtils', function($eventUtils) {
	return {
		priority: Number.MAX_SAFE_INTEGER,
        restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			$eventUtils.attachEventHandlerStop(elem, scope, attrs.evStop);
		}
	};
}]);