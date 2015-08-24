'use strict'

angular
  .module('adventureplanner.main')
  .factory('dataService', function dataService (locationService){
    var instance = {
      getVenues: getVenues,
      venues: ''
    };

    return instance;

    //////////////

    function getVenues () {
      return locationService.get()
        .then(function (response) {
          instance.venues = response.data.response.groups[0].items;
          return {venues: instance.venues};
          // console.log(response.data.response);
        })
    }
  })
  .factory('locationService', function locationService ($http) {
    
    var service = {
      get: get,
      testHttp: function(){ console.log('http Service Working');}
    };
    
    return service;
    
    //////////////
    

    function get() {
      var venueUrl = _buildLocationRequest (locationParams());
      return $http.get(venueUrl);
    }

    function _buildLocationRequest (params) {
      return 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                 params.id +
                 '&client_secret=' +
                 params.secret +
                 '&v=20130815&' +
                 'll=' + params.lat + ',' + params.lng +
                 '&query=' + params.query +
                 '&offset=' + params.offset +
                 '&radius=130000' +
                 '&sortByDistance=1';
    }

    function locationParams (params ) {
      if (!params) {params = {};}
      var max = params.hasOwnProperty('max') ? params.max : 20;
      var queryVenue = params.hasOwnProperty('query') ? params.query : 'mountain';
      
      function _randNum () {
        return Math.floor((Math.random() * max) + 1 );
      }
      return {
        id: 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O',
        secret: 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM',
        lat: '37.794',
        lng: '-122.408',
        offset: _randNum(20),
        query: queryVenue
      };
    }
  })
  .controller('MainCtrl', function ($scope, $window, dataService) {
    $scope.service = dataService;
    $scope.service.getVenues();
  });