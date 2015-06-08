angular.module('eventUtils')

.directive('evUpon', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {

			$eventUtils.attachConditionTriggers(elem, scope, attrs.evUpon);
		}
	};
}]);