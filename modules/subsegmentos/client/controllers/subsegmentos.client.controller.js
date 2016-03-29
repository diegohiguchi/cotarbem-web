(function () {
  'use strict';

  // Subsegmentos controller
  angular
    .module('subsegmentos')
    .controller('SubsegmentosController', SubsegmentosController);

  SubsegmentosController.$inject = ['$scope', '$state', 'Authentication', 'subsegmentoResolve', 'SegmentosService'];

  function SubsegmentosController ($scope, $state, Authentication, subsegmento, SegmentosService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.segmentos = SegmentosService.query();
    vm.subsegmento = subsegmento;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.subsegmento.ativo = true;

    // Remove existing Subsegmento
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.subsegmento.$remove($state.go('subsegmentos.list'));
      }
    }

    // Save Subsegmento
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.subsegmentoForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.subsegmento._id) {
        vm.subsegmento.$update(successCallback, errorCallback);
      } else {
        vm.subsegmento.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('subsegmentos.view', {
          subsegmentoId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
