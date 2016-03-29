(function () {
    'use strict';

    angular
        .module('cotacoes')
        .controller('CotacoesFornecedorListController', CotacoesFornecedorListController);

    CotacoesFornecedorListController.$inject = ['SolicitacoesSegmentoService', '$filter'];

    function CotacoesFornecedorListController(SolicitacoesSegmentoService, $filter) {
        var vm = this;

        SolicitacoesSegmentoService.query(function (data) {
            vm.solicitacoes = data;
            vm.buildPager();
        });

        vm.buildPager = function () {
            vm.pagedItems = [];
            vm.itemsPerPage = 5;
            vm.currentPage = 1;
            vm.figureOutItemsToDisplay();
        };

        vm.figureOutItemsToDisplay = function () {
            vm.filteredItems = $filter('filter')(vm.solicitacoes, {
                $: vm.search
            });
            vm.filterLength = vm.filteredItems.length;
            var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
            var end = begin + vm.itemsPerPage;
            vm.pagedItems = vm.filteredItems.slice(begin, end);
        };

        vm.pageChanged = function () {
            vm.figureOutItemsToDisplay();
        };
    }
})();

