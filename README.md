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
