(function () {
  'use strict';

  // Segmentos controller
  angular
    .module('segmentos')
    .controller('SegmentosController', SegmentosController);

  SegmentosController.$inject = ['$scope', '$state', 'Authentication', 'segmentoResolve'];

  function SegmentosController ($scope, $state, Authentication, segmento) {
    var vm = this;

    vm.authentication = Authentication;
    vm.segmento = segmento;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.segmento.ativo = true;

    // Remove existing Segmento
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.segmento.$remove($state.go('segmentos.list'));
      }
    }

    // Save Segmento
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.segmentoForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.segmento._id) {
        vm.segmento.$update(successCallback, errorCallback);
      } else {
        vm.segmento.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('segmentos.view', {
          segmentoId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
