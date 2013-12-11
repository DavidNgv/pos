'use strict';

angular.module('posApp')
  .factory('remoteDatabase', ['$q', '$rootScope', 'restful',function ($q, $rootScope, restful) {

    var BaseModel = function(tableName) {
      this.tableName = tableName;
    };

    BaseModel.prototype.toArray = function() {
      var def = $q.defer();

      restful.get( {table: this.tableName, limit: 1000}, function(resp){
        if (resp.success) {
          def.resolve(resp);
        } else {
          def.reject(resp.message);
        }
      });

      return def.promise;
    };

    var menuData = new BaseModel('menudata');

    var remoteDatabase = {
      menuData: menuData
    };

    return remoteDatabase;
  }]);
