(function () {
    'use strict';

    angular
        .module('solicitacoes')
        .controller('SolicitacoesListController', SolicitacoesListController);

    SolicitacoesListController.$inject = ['SolicitacoesService', '$filter', 'Socket', 'Authentication'];

    function SolicitacoesListController(SolicitacoesService, $filter, Socket, Authentication) {
        var vm = this;
        vm.authentication = Authentication;

        function carregarSolicitacoes(){
            SolicitacoesService.query(function (data) {
                vm.solicitacoes = data;
                vm.buildPager();
            });
        }

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

        Socket.on('envia-cotacao-encerrada', function(data){
            carregarSolicitacoes();
        });

        function init(){
            carregarSolicitacoes();
            Socket.emit('adiciona-usuario', vm.authentication.user);
        }

        init();
    }
})();
