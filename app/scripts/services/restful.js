'use strict';

angular.module('posApp')
  .service('restful', ['$resource', '$rootScope', function ($resource, $rootScope) {

    // AngularJS will instantiate a singleton by calling   'new  ' on this function
    return $resource($rootScope.apiHost + '/api/databases/abc/collections/:table/:id', {
      id:   '@id',
      table:   '@table'
    }, {
      'get': {method: 'GET'},
      'save': {method: 'POST', params: {}},
      'put': {method: 'PUT', params: {}},
      'query': {method: 'GET', isArray: true},
      'remove': {method: 'DELETE', params: {}},
      'delete': {method: 'DELETE', params: {}}
    });
  }]);
