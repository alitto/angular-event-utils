'use strict';

describe('ev-init directive unit test', function() {

	var MODULE = 'eventUtils';

	var scope, $compile, element;
    
    beforeEach(module(MODULE));

    // Inject scope and $compile service
    beforeEach(inject(function (_$rootScope_, _$compile_) {
        scope = _$rootScope_;
        $compile = _$compile_;
    }));

    it('should trigger event on load', function (done) {

        // Listen to init event
        scope.$on('custom init event', function(e, data){
            expect(data.foo).toBe('bar');
            
            // Remove element
            if(element){
                element.remove();
            }
            
            done();
        });

        // Compile directive and add to dom
        element = $compile('<div ev-init="\'custom init event\': { foo: \'bar\' }"></div>')(scope);
        angular.element(document.body).append(element);
    });
});