angular
  .module('adventureplanner.main')
  .controller('MainCtrl', function ($scope, $window, $http) {
    'use strict';
    
    var myId = 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O';
    var mySecret = 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM';

    $http.get('https://api.foursquare.com/v2/venues/explore?client_id=' + myId + '&client_secret=' + mySecret + '&v=20130815&ll=37.794,-122.408&query=park').success(function(data) {
      $scope.explore = data;
    });







    // $scope.todos = JSON.parse($window.localStorage.getItem('todos') || '[]');
    // $scope.$watch('todos', function (newTodos, oldTodos) {
    //   if (newTodos !== oldTodos) {
    //     $window.localStorage.setItem('todos', JSON.stringify(angular.copy($scope.todos)));
    //   }
    // }, true);

    // $scope.add = function () {
    //   var todo = {label: $scope.label, isDone: false};
    //   $scope.todos.push(todo);
    //   $window.localStorage.setItem('todos', JSON.stringify(angular.copy($scope.todos)));
    //   $scope.label = '';
    // };

    // $scope.check = function () {
    //   this.todo.isDone = !this.todo.isDone;
    // };
  


  });
