'use strict'

angular
  .module('adventureplanner.main')
  .controller('MainCtrl', function ($scope, $window, dataService) {
    $scope.service = dataService;
  });