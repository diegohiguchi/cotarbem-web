(function () {
    'use strict';

    // Cotacoes controller
    angular
        .module('cotacoes')
        .controller('CotacoesClienteController', CotacoesClienteController);

    CotacoesClienteController.$inject = ['$scope', '$state', 'Authentication', 'CotacoesService', '$stateParams',
        'cotacaoResolve', 'cotacoesApiService', 'notificacoesApiService'];

    function CotacoesClienteController ($scope, $state, Authentication, CotacoesService, $stateParams,
                                        cotacaoResolve, cotacoesApiService, notificacoesApiService) {
        var vm = this;

        vm.authentication = Authentication;
        vm.cotacoes = [];
        vm.produtos = [];
        vm.itensSelecionados = [];
        vm.produtosSelecionados = [];
        vm.fornecedoresSelecionados = [];
        vm.solicitacao = cotacaoResolve;
        vm.error = null;
        vm.form = {};
        vm.total = 0;
        vm.remove = remove;
        vm.save = save;

        vm.marcaTodosItens = function () {
            if (vm.selecionaTodos) {
                vm.selecionaTodos = true;
            } else {
                vm.selecionaTodos = false;
            }

            angular.forEach(vm.cotacoes, function (produto) {
                produto.forEach(function(item){
                    item.selecionado = vm.selecionaTodos;

                    if(vm.selecionaTodos)
                        vm.adicionarProduto(item);
                    else {
                        vm.produtosSelecionados = [];
                        vm.total = 0;
                    }
                });
            });
        };

        // Remove existing Cotacao
        function remove() {
            if (confirm('Are you sure you want to delete?')) {
                vm.cotacao.$remove($state.go('cotacoes.list'));
            }
        }

        // Save Cotacao
        function save(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.cotacoForm');
                return false;
            }

            // TODO: move create/update logic to service
            if (vm.cotacao._id) {
                vm.cotacao.$update(successCallback, errorCallback);
            } else {
                vm.cotacao.$save(successCallback, errorCallback);
            }

            function successCallback(res) {
                /* jshint ignore:start */
                toastr.success('Salvo com sucesso');
                /* jshint ignore:end */
                $state.go('cotacoesFornecedor.list');
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }

        function calcularTotal(produtos){
            vm.total = 0;

            for(var i = 0; i < produtos.length; i++){
                var produto = produtos[i];
                vm.total += (produto.valor * produto.quantidade);
            }

            vm.total;
        };

        vm.adicionarProduto = function(produto){
            var produtoId = vm.produtosSelecionados.indexOf(produto);

            if (produtoId > -1)
                vm.produtosSelecionados.splice(produtoId, 1);
            else
                vm.produtosSelecionados.push(produto);

            calcularTotal(vm.produtosSelecionados);
        };

        vm.enviarProdutos = function(){
            if(vm.produtosSelecionados.length <= 0) {
                /* jshint ignore:start */
                toastr.error('Selecione o(s) produto(s)');
                /* jshint ignore:end */
                return;
            }

            vm.produtosSelecionados = _.groupBy(vm.produtosSelecionados, function(produto){
                return produto.user.displayName
            });

            notificacoesApiService.notificarFornecedoresProdutos(vm.produtosSelecionados).success(function(response){
                /* jshint ignore:start */
                toastr.success('Enviado com sucesso');
                /* jshint ignore:end */

                $state.go('cotacoesCliente.list');
            });
        };

        vm.voltar = function(){
            $state.go('cotacoesCliente.list');
        };

        function listarCotacoes(response){
            //CotacoesService.query().$promise.then(function(response){
            for(var i = 0; i < response.length; i++){
                /* if(response[i].solicitacao._id === $stateParams.solicitacaoId) {*/
                for(var j = 0; j < response[i].produtos.length; j++){
                    vm.cotacoes.push({
                        user: response[i].user,
                        _id: response[i].produtos[j]._id,
                        nome: response[i].produtos[j].nome,
                        codigo: response[i].produtos[j].codigo,
                        unidadeMedida: response[i].produtos[j].unidadeMedida,
                        quantidade: response[i].produtos[j].quantidade,
                        dataEntrega: response[i].produtos[j].dataEntrega,
                        imagemURL: response[i].produtos[j].imagemURL,
                        disponivel: response[i].produtos[j].disponivel,
                        valor: response[i].produtos[j].valor,
                        observacao: response[i].produtos[j].observacao
                    });
                }
                //}
            }

            if(vm.cotacoes.length > 0)
                vm.cotacoes = _.groupBy(vm.cotacoes, "nome");
            else
                vm.cotacoes = {};
            //});
        }

        function init(){
            cotacoesApiService.obterPorSolicitacaoId($stateParams.solicitacaoId).success(function (response) {
                listarCotacoes(response);
            }).error(function (response) {
                // Show user error message and clear form
            });
        }

        init();
    }
})();
