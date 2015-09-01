'use strict'

angular
  .module('adventureplanner.main')
  .controller('landingCtrl', function ($scope, $window, dataService) {
    $scope.service = dataService;
  });