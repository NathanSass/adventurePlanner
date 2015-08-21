angular
  .module('adventureplanner.main')
  .controller('MainCtrl', function ($scope, $window, $http) {
    'use strict';
    
    var myId = 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O';
    var mySecret = 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM';

    var lat = '37.794';
    var longi = '-122.408';
    // var latLong = '37.794,-122.408';
    var offset = Math.floor((Math.random() * 20) + 1 );
    
    var locationRequest = 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                 myId +
                 '&client_secret=' +
                 mySecret +
                 '&v=20130815&' +
                 'll=' + lat + ',' + longi +
                 '&query=mountain' +
                 // '&query=sushi' +
                 '&offset=' + offset +
                 // '&limit=10' +
                 '&radius=130000' +
                 '&sortByDistance=1';

    // var forecastKey = '4233057dd5ff3c197d4ae39ae8b05582';
    var weatherRequest = 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat + '&lon=' + longi;

    
    var apiCall = function (url, callback) {
        $http.get(url).success(function(data) {
          callback(data);
        });
    };

    var randNum = function (max) {
      return Math.floor((Math.random() * max) + 1 );
    };

    var locationCallback = function (data){
      $scope.currentLocation = data.response.headerFullLocation;
      $scope.places = data.response.groups[0].items; //need venue.name 
    };

    var weatherCallback = function (data) {
      $scope.currentCondition = data.weather[0]['description'];
      $scope.currentTemp = data.main.temp;
      console.log(data);
    };

    // $http.get(weatherRequest).success(function(data) {
    //       console.log(data);
    // });

    apiCall(locationRequest, locationCallback);
    // console.log(weatherRequest);
    apiCall(weatherRequest, weatherCallback);

    // $http.get(locationRequest).success(function(data) {
    // });






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
