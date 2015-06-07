angular.module('eventUtils')

.directive('evEcho', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			$eventUtils.attachEventHandlerEcho(elem, scope, attrs.evEcho);
		}
	};
}]);