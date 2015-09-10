'use strict'

angular
  .module('adventureplanner.main')
  .factory('venueService', function venueService ($http) {
    
    var service = {
      get: get
    };
    
    return service;
    
    //////////////
    
    function get(params) {
      var request = buildVenueRequest (params);
      return $http.get(request);
    }

    function buildVenueRequest (params) {
      var id     = 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O';
      var secret = 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM';

      function _randNum (max) {
        return Math.floor((Math.random() * max) + 1 );
      }
      
      return 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                 id   +
                 '&client_secret='  +
                  secret            +
                 '&v=20130815&'     +
                 'll=' + params.lat + ','   + params.lng +
                 '&query='  + params.query  +
                 '&offset=' + _randNum(params.offset)    +
                 '&limit='  + params.limit  +
                 '&radius=130000'   +
                 '&sortByDistance=1';
    }
  });