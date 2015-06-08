'use strict';

angular.module('myApp.view1', ['ngRoute', 'myApp.loginForm'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$eventUtils', function($scope, $eventUtils) {

	// Enable debugging
	$eventUtils.debugEnabled = true;

	// Trigger service from events instead of exposing interface directly to the view
	$scope.$on('greet user', function(e, data){

		alert('Hello user!');
	});

	$scope.$on('login', function(e, data){

		console.log('Login data', data);

		setTimeout(function(){
			if(data.password.length >= 8){
				$scope.$broadcast('login success', true);
			}else{
				$scope.$broadcast('login error', {
					errorMessage: 'Password is too short'
				});
			}
		}, 2000);
	});
	
}])

.directive('isolatedScope', [function() {
	return {
		restrict: 'A',
		scope: true
	};
}]);