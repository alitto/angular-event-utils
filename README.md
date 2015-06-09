# angular-event-utils ![Travis badge](https://travis-ci.org/alitto/angular-event-utils.svg)
Collection of AngularJS directives to work with scope and DOM events in a convenient way

##Getting Started
1. Just download, clone or fork it, or install it using bower `$ bower install angular-event-utils`
2. Include angular-event-utils.js (or angular-event-utils.min.js) in your index.html, after including Angular itself
3. Add 'eventUtils' to your main module's list of dependencies

When you are done, your setup should look similar to the following:

```html
<!doctype html>
<html ng-app="myApp">
<head>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.6/angular.min.js"></script>
    <script src="js/angular-event-utils.min.js"></script>
    <script>
        var myApp = angular.module('myApp', ['eventUtils']);
    </script>
    ...
</head>
<body>
    ...
</body>
</html>
```

##Basic Usage

###Capturing events
Capture scope event 'saved' in a div element and display a success message:

```html
<div ev-on="'saved' : showMessage = true" ng-show="showMessage" class="alert alert-success">
    Your changes have been saved!
</div>
```
###Translating events
Translate 'click' events into a more meaningful 'sort items' scope event:

```html
<button ev-as="'click' : 'sort items'">Sort</button>
```
*Note: ev-as does not stop the propagation of the original event (in this case, button's 'click' event)*

###Replacing events
Replace form's 'submit' events with the 'save' scope event:
```html
<form ev-replace="'submit' : 'save'">
    ...
</form>
```
*Note: ev-replace stops the propagation of the original event (in this case, form's 'submit' event)*

##Directives

###ev-as=" 'event name' : 'event alias', *arg1, *arg2, ... "
This directive allows to *translate* or *alias* DOM and scope events by triggering a scope event with a different name. This is useful when you want to emit/broadcast a scope event every time the user interacts with an element. 

When translating Angular's scope events, this directive will use scope.$emit to propagate the new event if the original event was emitted by any of the parent scopes, and will use scope.$broadcast instead if the original event was broadcasted by any of the child scopes. If the original event was emitted or broadcasted in the same scope, scope.$emit is used to propagate it.

####Translate single event
E.g.: translate link's 'click' event into a scope event named 'enable':
```html
<a ev-as="'click' : 'enable'">Enable</a>
```
####Translate multiple events
```html
<a ev-as="'click' : 'enable'; 'hover': 'enable hovered' ">Enable</a>
```
####Translate event with additional data
```html
<a ev-as="'click' : 'enable', { foo: 'bar' }">Enable</a>
<a ev-as="'click' : 'disable', { foo: 'bar' }">Disable</a>
```
####Access original event and arguments
You can reference the original DOM or scope event and its arguments using the follwing vars:
* `$event` Reference to aliased DOM or scope event
* `$args` Reference to an array containing the arguments of the aliased DOM or scope event
* `$data` Reference to the first element of the $args array (equivalent to $args[0])

```html
<a ev-as="'click' : 'enable', { foo: 'bar' } ">Enable</a>
<a ev-as="'click' : 'disable', { foo: 'bar', data: $data, clickEvent: $event } ">Disable</a>
```
*Note: ev-as does not stop the propagation of the original event (in this case, button's 'click' event)*

###ev-echo=" 'event name 1', 'event name 2', ... "
This directive allows to propagate scope events emitted on any of the child scopes to its siblings.

E.g.: Assuming #div1 and #div2 have isolated scopes, the ev-echo directive in #main will broadcast the 'save' events coming from #div2 to #div1.
```html
<div id="main" ev-echo="'save'">
    <div id="div1" isolated-scope>
        ...
        <div ev-on="'save': showMessage" ng-show="showMessage">
            Saved was clicked!
        </div>
    </div>
    <div id="div2" isolated-scope>
        ...
        <button ev-on="'click' : 'save'">Save</button>
    </div>
</div>
```

###ev-init=" 'event name', *arg1, *arg2, ..."
This directive allows to fire a custom scope event when an element is completely initialized, after all the directives have been compiled and linked.

E.g.: Broadcast the 'populate' event to the <login-form> component along with some initialization data once it has been compiled and linked:
```html
<login-form ev-init="'populate' : { name: 'someone@email.com' }">
</login-form>
```

###ev-on=" 'event name' : expression to evaluate"
This directive allows to capture specific events and perform some operations on the current scope. 

####Capture single event
E.g.: Capture 'success' event and display a message to the user:
```html
<div ev-on="'success' : showMessage = true" ng-show="showMessage">
    Your are awesome!
</div>
```

####Capture multiple events
E.g.: Capture 'stopped' and 'paused' events and display a message to the user:
```html
<div ev-on="'stopped' : status = 'Stopped'; 
            'paused' : status = 'Paused';" ng-show="status">
    Current status is {{status}}
</div>
```

####Access original event and arguments
You can reference the original DOM or scope event and its arguments using the follwing vars:
* `$event` Reference to aliased DOM or scope event
* `$args` Reference to an array containing the arguments of the aliased DOM or scope event
* `$data` Reference to the first element of the $args array (equivalent to $args[0])

E.g.: Capture 'success' event and show the message passed in the event's arguments:
```html
<div ev-on="'success' : msg = $data" ng-show="msg">
    {{msg}}
</div>
```

###ev-replace


###ev-stop

###ev-when
