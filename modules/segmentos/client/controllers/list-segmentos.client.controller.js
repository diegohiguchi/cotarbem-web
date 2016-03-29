(function () {
  'use strict';

  angular
    .module('segmentos')
    .controller('SegmentosListController', SegmentosListController);

  SegmentosListController.$inject = ['SegmentosService'];

  function SegmentosListController(SegmentosService) {
    var vm = this;

    vm.segmentos = SegmentosService.query();
  }
})();
