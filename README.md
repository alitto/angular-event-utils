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
<a ev-as="'click' : 'enable', { foo: 'bar' } ">Enable</a>
<a ev-as="'click' : 'disable', { foo: 'bar' } ">Disable</a>
```
####Access original event and event arguments
You can reference the original DOM or scope event and its arguments using the follwing vars:
* `$event`: Reference to aliased DOM or scope event
* `$args`: Reference to an array containing the arguments of the aliased DOM or scope event
* `$data`: Reference to the first element of the $args array (equivalent to $args[0])

```html
<a ev-as="'click' : 'enable', { foo: 'bar' } ">Enable</a>
<a ev-as="'click' : 'disable', { foo: 'bar', data: $data, clickEvent: $event } ">Disable</a>
```

###ev-echo

###ev-init

###ev-on

###ev-replace

###ev-stop

###ev-when
