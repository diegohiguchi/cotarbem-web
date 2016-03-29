//Subsegmentos service used to communicate Subsegmentos REST endpoints
(function () {
  'use strict';

  angular
    .module('subsegmentos')
    .factory('SubsegmentosService', SubsegmentosService);

  SubsegmentosService.$inject = ['$resource'];

  function SubsegmentosService($resource) {
    return $resource('api/subsegmentos/:subsegmentoId', {
      subsegmentoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
