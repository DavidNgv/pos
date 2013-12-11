'use strict';

angular.module('posApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap.pagination',
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(['$rootScope', function($rootScope){

    $rootScope.apiHost = 'http://localhost:6789';
    $rootScope.mediaHost = $rootScope.apiHost;

  }]);
