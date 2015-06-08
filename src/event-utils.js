
angular.module('eventUtils')

.factory('$eventUtils', [function(){

	var EventUtils = {
		EVENT_SEPARATOR: ',',
		ENTRY_SEPARATOR: '\;',
		KEY_VALUE_SEPARATOR: ':',
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

		var events = this.evalAsArray(scope, eventsStr);
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

	EventUtils.attachEventHandlerStop = function(elem, scope, eventsStr){

		var events = this.evalAsArray(scope, eventsStr);
		var self = this;
		angular.forEach(events, function(eventName){

			// Stop propagation when any of these events fire
			scope.$on(eventName, function(e){
				if(e.stopPropagation) e.stopPropagation();
				if(e.preventDefault) e.preventDefault();

				self.debug('Stopped event %s', eventName);
				return false;
			});
		});
	};

	EventUtils.attachConditionTriggers = function(elem, scope, conditionsStr){

		var conditions = this._parseEntries(conditionsStr);
		var self = this;
		
		// Register a watcher for every condition
		angular.forEach(conditions, function(condition){
			
			scope.$watch(condition.key, function(newValue, oldValue){

				if(newValue !== oldValue && 
					newValue){
					// Trigger event when newValue is true
					var eventArgs = self.evalAsArray(scope, condition.value);
					scope.$emit.apply(scope, eventArgs);
					self.debug('Emitted event %s because condition \'%s\' evals to true', eventArgs[0], condition.key);
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
		var entries = this._parseEntries(str);
		var self = this;
		
		angular.forEach(entries, function(entry){
			// Parse keys
			var keys = self.evalAsArray(scope, entry.key);

			// Add keys to the map
			angular.forEach(keys, function(key){
				map[key] = entry.value;
			});
		});

		return map;
	};

	EventUtils._parseEntries = function(str){
		
		var result = [];
		var entries = this.splitUnescaped(str, this.ENTRY_SEPARATOR);
		var self = this;
		var escapedChars = self.ENTRY_SEPARATOR + self.KEY_VALUE_SEPARATOR;

		angular.forEach(entries, function(entry){

			if(entry){
				// Parse key and value
				var parts = self.splitFirstUnescaped(entry, self.KEY_VALUE_SEPARATOR);
				var key = self.unescapeChars(parts[0], escapedChars);
				var value = parts.length > 1 ? self.unescapeChars(parts[1], escapedChars): null;

				// Add entry
				result.push({
					key: key,
					value: value
				});
			}
		});

		return result;
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