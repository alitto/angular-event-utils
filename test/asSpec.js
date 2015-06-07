'use strict';

describe('ev-as directive unit test', function() {

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
        element = $compile('<div ev-as="\'original event\': \'aliased event\', { foo: \'bar\' }"></div>')(scope);
        angular.element(document.body).append(element);
    });

    // Remove element
    afterEach(function () {
        element.remove();
    });

    it('should alias emitted "original event" event with "aliased event"', function (done) {

        scope.$on('original event', function(e, data){
            console.log('Got original event', e, data);
        });

        scope.$on('aliased event', function(e, data){
            expect(data.foo).toBe('bar');
            done();
        });

    	// Emit event
		scope.$emit('original event');
    });

    it('should alias broadcasted "original event" event with "aliased event"', function (done) {

        scope.$on('aliased event', function(e, data){
            expect(data.foo).toBe('bar');
            done();
        });

        // Broadcast event
        scope.$broadcast('original event');
    });
});