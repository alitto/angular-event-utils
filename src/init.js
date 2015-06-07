
angular.module('eventUtils')
.directive('evInit', ['$eventUtils', function($eventUtils) {
	return {
		priority: Number.MAX_SAFE_INTEGER,
        restrict: 'A', // Attribute only
        link: function(scope, elem, attrs, ctrl) {

            // Parse events
            var events = $eventUtils.parseOptions(attrs.evInit, scope);

            // Trigger all events
            angular.forEach(events, function(expr, eventName){

                // Parse event arguments
                var eventArgs = $eventUtils.evalAsArray(expr, scope);

                // Trigger event
                scope.$broadcast.apply(scope, [eventName].concat(eventArgs));
            });
        }
	};
}]);