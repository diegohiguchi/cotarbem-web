(function () {
    'use strict';

    angular
        .module('cotacoes')
        .controller('CotacoesClienteListController', CotacoesClienteListController);

    CotacoesClienteListController.$inject = ['CotacoesService'];

    function CotacoesClienteListController(CotacoesService) {
        var vm = this;

        vm.cotacoes = CotacoesService.query();
    }
})();
