'use strict';

describe("$eventUtils service unit test", function() {

	var MODULE = 'eventUtils';

	var $eventUtilsService = null;

    beforeEach(module(MODULE));

    it('should inject $eventUtils service', inject(function($eventUtils){
        expect($eventUtils).not.toEqual(null);
    }));
    
});