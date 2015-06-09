angular.module('eventUtils')

.directive('evWhen', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {

			$eventUtils.attachConditionTriggers(elem, scope, attrs.evWhen);
		}
	};
}]);