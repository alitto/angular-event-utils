'use strict';

describe('ev-on directive unit test', function() {

	var MODULE = 'eventUtils';

	var scope, $compile, element;
    
    beforeEach(module(MODULE));

    // Inject scope and $compile service
    beforeEach(inject(function (_$rootScope_, _$compile_) {
        scope = _$rootScope_;
        $compile = _$compile_;
    }));

	// Compile directive and add to dom
    beforeEach(function () {
        element = $compile('<div ev-on="\'enable event\': flag=true;\'disable event\': flag=false"></div>')(scope);
        angular.element(document.body).append(element);
    });

    // Remove element
    afterEach(function () {
        element.remove();
    });

    it('should evaluate expression upon events', function () {

    	// Emit event
		scope.$emit('enable event');

		expect(scope.flag).toBe(true);
		
		// Broadcast event
		scope.$broadcast('disable event');
		expect(scope.flag).toBe(false);
    });
});