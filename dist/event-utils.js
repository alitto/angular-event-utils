
// Create module
angular.module('eventUtils', []);
angular.module('eventUtils')

.directive('evAs', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			
			// Listen to events and re-emit them with a different name
			$eventUtils.attachEventHandlerReplacement(elem, scope, attrs.evAs, false);
		}
	};
}]);
angular.module('eventUtils')

.directive('evEcho', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			$eventUtils.attachEventHandlerEcho(elem, scope, attrs.evEcho);
		}
	};
}]);

angular.module('eventUtils')

.factory('$eventUtils', [function(){

	var EventUtils = {
		EVENT_SEPARATOR: ',',
		OPTION_SEPARATOR: '\;',
		KEY_EXPR_SEPARATOR: ':',
		debugEnabled: false,
		domEvents: {
			
			// Mouse events
			'click': {
				type: 'mouse'
			},
			'dblclick': {
				type: 'mouse'
			},
			'mousedown': {
				type: 'mouse'
			},
			'mouseup': {
				type: 'mouse'
			},
			'hover': {
				type: 'mouse'
			},
			'mouseenter': {
				type: 'mouse'
			},
			'mouseleave': {
				type: 'mouse'
			},
			'mousemove': {
				type: 'mouse'
			},
			'mouseout': {
				type: 'mouse'
			},
			'mouseover': {
				type: 'mouse'
			},

			// Form events
			'submit': {
				type: 'form',
				tags: ['FORM']
			},
			'focus': {
				type: 'form'
			},
			'blur': {
				type: 'form'
			},
			'change': {
				type: 'form',
				tags: ['INPUT', 'TEXTAREA', 'SELECT']
			},
			'focusin': {
				type: 'form'
			},
			'focusout': {
				type: 'form'
			},
			'select': {
				type: 'form',
				tags: ['INPUT', 'TEXTAREA']
			},

			// Keyboard events
			'keydown': {
				type: 'keyboard'
			},
			'keyup': {
				type: 'keyboard'
			},
			'keypress': {
				type: 'keyboard'
			},

			// Browser events
			'scroll': {
				type: 'browser'
			},

			// Window events
			'resize': {
				type: 'window',
				elems: [ window ]
			},

			// Resource events
			'load': {
				type: 'resource',
				tags: [ 'IMG', 'SCRIPT', 'LINK', 'EMBED', 'AUDIO', 'VIDEO', 'FRAME', 'IFRAME'],
				elems: [ window ]
			},

			'error': {
				type: 'resource',
				tags: [ 'IMG', 'SCRIPT', 'LINK', 'EMBED', 'AUDIO', 'VIDEO', 'FRAME', 'IFRAME'],
				elems: [ window ]
			},

			// Document events
			'ready': {
				type: 'document',
				elems: [ window.document ]
			}
		}
	};

		// Create event handlers from expressions for each event
	EventUtils.attachEventHandlerActions = function(elem, scope, eventsStr){
		// Parse events from string
		var eventMap = this.parseOptions(eventsStr, scope);

		var self = this;
		var handlers = {};

		// Create handlers for each event
		angular.forEach(eventMap, function(expr, eventName){

			handlers[eventName] = function(e, args, isDomEvent){

				// Evaluate expression
				scope.$eval(expr, {
					$event: e,
					$data: args.length > 0 ? args[0] : undefined,
					$args: args
				});

				// Notify changes to angular
				if(isDomEvent){
					scope.$apply();
				}
			};
		});
	
		// Attach handlers
		this._attachEventHandlers(elem, scope, handlers);
	};

	// Create event handlers from expressions for each event
	EventUtils.attachEventHandlerReplacement = function(elem, scope, eventsStr, stopPropagation){
		
		// Parse events from string
		var eventMap = this.parseOptions(eventsStr, scope);

		var self = this;
		var handlers = {};

		// Create handlers for each event
		angular.forEach(eventMap, function(expr, eventName){

			handlers[eventName] = function(e, args, isDomEvent){
				var eventArgs = self.evalAsArray(scope, expr, {
					$event: e,
					$data: args.length > 0 ? args[0] : null,
					$args: args
				});
					
				if(eventArgs.length === 1){
					// No arguments defined on this event, pass args from original event
					eventArgs = eventArgs.concat(args);
				}

				// Stop event propagation
				if(stopPropagation){
					if(e.stopPropagation) e.stopPropagation();
					if(e.preventDefault) e.preventDefault();
				}

				// Check name
				if(!isDomEvent &&
					eventName === eventArgs[0]){
					return console.error('Attempting to replace event "%s" with an event of the same name ("%s") in element', eventName, eventArgs[0], elem[0]);
				}

				// Trigger replacement event
				if(isDomEvent){
					scope.$emit.apply(scope, eventArgs);
					self.debug('Replaced DOM event "%s" with emitted event "%s" in element', eventName, eventArgs[0], elem[0]);
				}else{
					// Trigger replacement event
					if(self.isChildScope(scope, e.targetScope)){
						scope.$broadcast.apply(scope, eventArgs);
						self.debug('Replaced scope event "%s" with broadcasted event "%s" in element', eventName, eventArgs[0], elem[0]);
					}else{
						scope.$emit.apply(scope, eventArgs);
						self.debug('Replaced scope event "%s" with emitted event "%s" in element', eventName, eventArgs[0], elem[0]);
					}
				}
				scope.$apply();
			};
		});
	
		// Attach handlers
		this._attachEventHandlers(elem, scope, handlers);
	};

	EventUtils.attachEventHandlerEcho = function(elem, scope, eventsStr){

		var events = (eventsStr + '').split(',');
		var self = this;

		angular.forEach(events, function(eventName){

			eventName = eventName.trim();

			if(!eventName) return; // Skip empty events

			scope.$on(eventName, function(e){

				var args = [];
				for(var i = 1; i < arguments.length; i++){
					args.push(arguments[i]);
				}

				if(self.isChildScope(e.targetScope, scope)){

					// Re-transmit events emitted from children to other siblings
					var childScope = scope.$$childHead;
					do{
						if(childScope){
							// Process this child scope
							if(!self.isChildScope(e.targetScope, childScope)){
								childScope.$broadcast.apply(childScope, [ e.name ].concat(args));
								self.debug('Echo event %s to scope', e.name, childScope);
							}

							// Move to next sibling scope
							childScope = childScope.$$nextSibling;
						}
					}while(childScope);
				}
			});
		});
	};

	EventUtils._attachEventHandlers = function(elem, scope, handlers){
		var self = this;
		angular.forEach(handlers, function(handler, eventName){
			self._attachEventHandler(elem, scope, eventName, handler);
		});
	};

	// Attach unified event handler
	EventUtils._attachEventHandler = function(elem, scope, eventName, handler){
		eventName = eventName.trim();

		if(this.isDomEvent(eventName, elem[0])){

			// Listen to DOM event
			elem.on(eventName, function(e){
				
				var args = [];
				// No arguments defined on this event, pass from original event
				for(var i = 1; i < arguments.length; i++){
					args.push(arguments[i]);
				}

				// Trigger event handler
				handler(e, args, true);
			});
		}else{
			// Listen to scope event
			scope.$on(eventName, function(e){
				
				var args = [];
				// No arguments defined on this event, pass from original event
				for(var i = 1; i < arguments.length; i++){
					args.push(arguments[i]);
				}

				// Trigger event handler
				handler(e, args, false);
			});
		}
	};

	EventUtils.parseOptions = function(str, scope){
		
		var map = {};
		var options = this.splitUnescaped(str, this.OPTION_SEPARATOR);
		var self = this;
		var escapedChars = self.OPTION_SEPARATOR + self.KEY_EXPR_SEPARATOR;

		angular.forEach(options, function(option){

			if(option){
				// Parse option
				var parts = self.splitFirstUnescaped(option, self.KEY_EXPR_SEPARATOR);
				var keysExpr = self.unescapeChars(parts[0], escapedChars);
				var keys = self.evalAsArray(scope, keysExpr);
				var value = parts.length > 1 ? self.unescapeChars(parts[1], escapedChars): null;

				// Add keys to the map
				angular.forEach(keys, function(key){
					map[key] = value;
				});
			}
		});

		return map;
	};

	// Eval the given expression as if it were an array
	EventUtils.evalAsArray = function(scope, expr, locals){
		return scope.$eval('[' + expr + ']', locals);
	};

	// Check whether the given scope is child of the given parentScope
	EventUtils.isChildScope = function(scope, parent){
		if(scope &&
			(scope.$parent === parent || 
			this.isChildScope(scope.$parent, parent))){
			return true;
		}
		return false;
	};

	EventUtils.isDomEvent = function(eventName, elem){
		var domEvent = this.domEvents[eventName];
		if(typeof domEvent !== 'undefined'){

			if(domEvent.tags){
				return domEvent.tags.indexOf(elem.tagName) !== -1;
			}

			if(domEvent.elems){
				return domEvent.elems.indexOf(elem) !== -1;
			}

			return true;
		}
		return false;
	};

	// Split a string by unescaped separator
	EventUtils.splitUnescaped = function(str, separator){
		return (str || '')
			.replace(new RegExp('([^\\\\])' + separator, 'g'), '$1$1' + separator)
			.split(new RegExp('[^\\\\]' + separator));
	};

	// Split a string by unescaped separator
	EventUtils.splitFirstUnescaped = function(str, separator){
		var parts = this.splitUnescaped(str, separator);
		return parts.length > 2 ? [parts[0]].concat(parts.slice(1).join(separator)) : parts;
	};

	// Unescape the given chars
	EventUtils.unescapeChars = function(str, chars){
		var chr = null;
		for(var i = 0; i < chars.length; i++){
			chr = chars.charAt(i);
			str = str.replace(new RegExp('\\\\' + chr, 'g'), chr);
		}
		return str;
	};

	EventUtils.debug = function(){
		if(this.debugEnabled){
			console.debug.apply(console, arguments);
		}
	};

	return EventUtils;
}]);

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
                var eventArgs = $eventUtils.evalAsArray(scope, expr);

                // Trigger event
                scope.$broadcast.apply(scope, [eventName].concat(eventArgs));
            });
        }
	};
}]);

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
angular.module('eventUtils')

.directive('evReplace', ['$eventUtils', function($eventUtils) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs, ctrl) {
			
			// Attach event handlers and stop propagation
			$eventUtils.attachEventHandlerReplacement(elem, scope, attrs.evReplace, true);
		}
	};
}]);