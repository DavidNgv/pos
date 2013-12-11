'use strict';

angular.module('posApp')
  .controller('MainCtrl', ['$scope', '$rootScope', '$q', 'remoteDatabase', function ($scope, $rootScope, $q, remoteDatabase) {

    var _table = 'menudata';
    var _totalItem = 0;

    $scope.limit = 10;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = 5;

    $scope.crudProcessing = false;
    $scope.readProcessing = false;

    $scope.sorters = [
      {
        property: 'name',
        direction: 'ASC'
      }
    ];

    $scope.filters = [
      {
        property: 'name',
        value: '',
        type: 'string',
        comparison: 'like'
      },
      {
        property: 'type',
        value: ['doan', 'douong'],
        type: 'string',
        comparison: 'bt'
      }
    ];



    $data.Entity.extend('$posDatabase.Types.Menudata', {
      cid: { type: 'int', key: true, computed: true },
      _id: { type: String },
      id: { type: String },
      name: { type: String },
      enName: { type: String },
      type: { type: String },
      createdTime: { type: Date },
      price: { type: Number },
      allowOrder: { type: Boolean },
      url: { type: String }
    });

    $data.EntityContext.extend('$posDatabase.Types.PosContext', {
      Menudata: { type: $data.EntitySet, elementType: $posDatabase.Types.Menudata }
    });

    var updateView = function() {
      console.log('updateView');

      if ($posDatabase.context) {
        $posDatabase.context.Menudata.skip(0).take(10).toArray(function(items){
          $scope.$apply(function(){
            $scope.menuData = items;
          });
        });
      }
      return false;
    };

    var resetLocal = function() {
      var menuData = $posDatabase.context.Menudata.toArray();

      return $q.when(menuData)
        .then(function (menuData) {
          menuData.forEach(function (m) { $posDatabase.context.Menudata.remove(m); });
          return $posDatabase.context.saveChanges();
        });
    };

    var sync = function() {
      var menuData = remoteDatabase.menuData.toArray();
      return $q.when(menuData)
        .then(function (resp) {
          _totalItem = resp.total;
          $posDatabase.context.Menudata.addMany(resp.data);
          return $posDatabase.context.saveChanges();
        });
    };

    var refreshCurrentPage = function () {
      $scope.readProcessing = true;

      var getParams = {};
      getParams.table = _table;
      getParams.start = $scope.limit * ($scope.currentPage - 1);
      getParams.limit = $scope.limit

      var sortersStr = JSON.stringify($scope.sorters);
      getParams.sort = sortersStr;

      if ($scope.filters[0].value !== '') {
        getParams.filter = JSON.stringify($scope.filters);
      } else {
        var _filter = [ $scope.filters[1] ];
        getParams.filter = JSON.stringify(_filter);
      };

      if ($posDatabase.context) {
        $posDatabase.context.Menudata.skip(getParams.start).take(getParams.limit).toArray(function(items){
          $scope.$apply(function(){
            $scope.menuData = items;
            $scope.totalItems = _totalItem;
            $scope.readProcessing = false;
          });
        });
      }
    };

    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
      refreshCurrentPage();
    };


    $scope.toggleSave = true;
    var newMenuDataModel = new $posDatabase.Types.Menudata({name: 'Hello', allowOrder: true});
    $scope.data = newMenuDataModel;

    $scope.toSave = function () {
      newMenuDataModel = new $posDatabase.Types.Menudata({name: 'Hello', allowOrder: true});
      $scope.data = newMenuDataModel;

      $scope.toggleSave = true;
      $scope.toggleUpdate = false;
    };

    $scope.save = function (item) {
      console.log(item);

      $scope.crudProcessing = true;
      $posDatabase.context.add(item);
      $posDatabase.context.saveChanges().then(function() {
        console.log(arguments);
      });

      //refreshCurrentPage();
    };

    $scope.toggleUpdate = false;

    $scope.getUpdate = function (item) {
      $scope.data = item;
      $scope.target = item.id;
      $scope.toggleUpdate = true;
      $scope.toggleSave = false;
    };

    $scope.update = function (item) {
      console.log('item');
      $scope.crudProcessing = true;

      console.log(item);

      $posDatabase.context.Menudata.attach(item, true);
      item.entityState = $data.EntityState.Modified;

      console.log(item);

      $posDatabase.context.saveChanges().then(function(result) {
        console.log(arguments);
        $scope.crudProcessing = false;
      });
    };

    $scope.delete = function (id) {
      restful.delete({id: id, table: _table}, function (res) {
        console.log('Menu.js res of Delete: ', res.success);
        if (res.success) {
          displayMessage('success','Thông báo','Xóa thành công');
        }else{
          displayMessage('error','Lỗi','Lỗi xóa: ' + res.message);
        }
      });
      refreshCurrentPage();
    };

    $scope.statusSortName = 'down';
    $scope.statusSortPrice = 'up';

    $scope.sortByFieldName = function (fieldName) {
      $scope.sorters[0].property = fieldName;
      if ($scope.sorters[0].direction == "ASC") {
        $scope.sorters[0].direction = "DESC";
        (fieldName == 'name') ? $scope.statusSortName = 'up' : $scope.statusSortPrice = 'down';
      }
      else {
        $scope.sorters[0].direction = "ASC";
        (fieldName == 'name') ? $scope.statusSortName = 'down' : $scope.statusSortPrice = 'up';
      }
      refreshCurrentPage();
    };

    $scope.onNameChange = function (fieldName) {
      refreshCurrentPage();
    };

    $scope.getUrl = function(url){
      if (url) {
        return $rootScope.mediaHost + '/' + url
      } else {
        return 'vendor/img/food.png';
      }
    };

    $scope.searchType1 = true;
    $scope.searchType2 = true;

    $scope.onSearchType = function() {
      var searchTypeSelect = [];

      if ($scope.searchType1) {
        searchTypeSelect.push('doan');
      };

      if ($scope.searchType2) {
        searchTypeSelect.push('douong');
      };

      $scope.filters[1].value = searchTypeSelect
      refreshCurrentPage();
    };



    $posDatabase.context = new $posDatabase.Types.PosContext({ provider: 'local', databaseName: 'pos' });
    $q.when($posDatabase.context.onReady())
      .then(resetLocal)
      .then(sync)
      .then(refreshCurrentPage);



    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
