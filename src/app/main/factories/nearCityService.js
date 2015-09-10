'use strict'

angular
  .module('adventureplanner.main')
  .factory('nearCityService', function nearCityService ($http) {
    
    var service = {
      get: get,
      findBoundaries: findBoundaries,
      buildRequest: buildRequest
    };
    
    return service;
    
    //////////////
    
    function get ( params ) {
      var request = buildRequest(params);
      return $http.get(request);
    }

    function findBoundaries (params) {
      var lat  = parseFloat(params.lat);
      var lng  = parseFloat(params.lng);
      return {
        n: lat + 1.25,
        s: lat - 1.25,
        e: lng + 1.25,
        w: lng - 1.25
      };
    }

    function buildRequest ( params ) {
      var boundaries = service.findBoundaries(params);
      return 'http://api.geonames.org/citiesJSON?' +
        'north='    + boundaries.n   +
        '&south='   + boundaries.s   +
        '&east='    + boundaries.e   +
        '&west='    + boundaries.w   +
        '&maxRows=' + params.maxRows +
        '&lang=de&username=sturpon711';
    }

  });