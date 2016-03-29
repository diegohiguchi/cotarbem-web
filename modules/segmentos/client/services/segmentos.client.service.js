//Segmentos service used to communicate Segmentos REST endpoints
(function () {
  'use strict';

  angular
    .module('segmentos')
    .factory('SegmentosService', SegmentosService);

  SegmentosService.$inject = ['$resource'];

  function SegmentosService($resource) {
    return $resource('api/segmentos/:segmentoId', {
      segmentoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
