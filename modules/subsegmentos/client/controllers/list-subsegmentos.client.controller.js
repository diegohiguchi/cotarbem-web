(function () {
  'use strict';

  angular
    .module('subsegmentos')
    .controller('SubsegmentosListController', SubsegmentosListController);

  SubsegmentosListController.$inject = ['SubsegmentosService'];

  function SubsegmentosListController(SubsegmentosService) {
    var vm = this;

    vm.subsegmentos = SubsegmentosService.query();
  }
})();
