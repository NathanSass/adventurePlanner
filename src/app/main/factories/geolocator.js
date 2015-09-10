'use strict'

angular
  .module('adventureplanner.main')
  .factory('geolocator', function geolocator($location, $window, $timeout, dataService) {
    var service = {
      get: get,
      success: success
    };

    return service;
    
    //////////////

    function get () {
      if ($window.navigator.geolocation) {
          $window.navigator.geolocation.getCurrentPosition(success);
      }
      else {
        console.log("Geolocation is not supported by this browser.");
      }
    }

    function success (position){
      dataService.currentData.lat = position.coords.latitude;
      dataService.currentData.lng = position.coords.longitude;
      
      $timeout(function(){ 
        $location.path('home');
      },1);
    }
  });