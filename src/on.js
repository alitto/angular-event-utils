
angular.module('eventUtils')
.directive('evOn', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			
			// Parse handler
			$eventUtils.attachEventHandlerActions(elem, scope, attrs.evOn);
		}
	};
}]);