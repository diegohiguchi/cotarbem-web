/*
 (function () {
 'use strict';

 // Cotacoes controller
 angular
 .module('cotacoes')
 .controller('CotacoesFornecedorController', CotacoesFornecedorController);

 CotacoesFornecedorController.$inject = ['$scope', '$state', 'Authentication', 'cotacaoResolve'];

 function CotacoesFornecedorController ($scope, $state, Authentication, cotacao) {
 var vm = this;

 vm.authentication = Authentication;
 vm.cotacao = cotacao;
 vm.error = null;
 vm.form = {};
 vm.remove = remove;
 vm.save = save;

 vm.calcularSomaTotal = function(){
 var total = 0;
 for(var i = 0; i < vm.cotacao.produtos.length; i++){
 var produto = vm.cotacao.produtos[i];
 total += (produto.valor * produto.quantidade);
 }
 return total;
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
 /!* jshint ignore:start *!/
 toastr.success('Salvo com sucesso');
 /!* jshint ignore:end *!/
 $state.go('cotacoesFornecedor.list');
 }

 function errorCallback(res) {
 vm.error = res.data.message;
 }
 }
 }
 })();
 */
(function () {
    'use strict';

    // Solicitacoes controller
    angular
        .module('cotacoes')
        .controller('CotacoesFornecedorController', CotacoesFornecedorController);

    CotacoesFornecedorController.$inject = ['$scope', '$state', 'Authentication', 'CotacoesService',
        'cotacaoResolve',
        '$timeout', '$stateParams', 'cotacoesApiService'];

    function CotacoesFornecedorController ($scope, $state, Authentication, CotacoesService,
                                           cotacao,
                                           $timeout, $stateParams, cotacoesApiService) {

        var vm = this;
        vm.cotacoes = [];
        vm.authentication = Authentication;
        vm.solicitacao = cotacao;
        vm.cotacao = new CotacoesService();
        vm.error = null;
        vm.form = {};
        vm.remove = remove;
        vm.save = save;

        vm.calcularSomaTotal = function(){
            /*  var total = 0;
             for(var i = 0; i < vm.solicitacao.produtos.length; i++){
             var produto = vm.solicitacao.produtos[i];
             total += (produto.valor * produto.quantidade);
             }
             return total;*/
        };

        // Remove existing Solicitacoes
        function remove() {
            if (confirm('Are you sure you want to delete?')) {
                vm.solicitacao.$remove($state.go('solicitacoes.list'));
            }
        }

        // Save Solicitacoes
        function save(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.solicitacaoForm');
                return false;
            }

            // TODO: move create/update logic to service
            if (vm.cotacao._id) {
                vm.cotacao.produtos = vm.solicitacao.produtos;
                vm.cotacao.$update(successCallback, errorCallback);
            } else {
                vm.cotacao.solicitacao = vm.solicitacao._id;
                vm.cotacao.subSegmento = vm.solicitacao.subSegmento._id;
                vm.cotacao.produtos = vm.solicitacao.produtos;
                vm.cotacao.$save(successCallback, errorCallback);
            }

            function successCallback(res) {
                /* jshint ignore:start */
                toastr.success('Cotação salva com sucesso');
                /* jshint ignore:end */
                $state.go('cotacoesFornecedor.list');
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }

        vm.voltar = function(){
            $state.go('cotacoesFornecedor.list');
        };

        function obterDadosSolicitacao(cotacao){
            vm.solicitacao = {
                _id: cotacao.solicitacao._id,
                ativo: cotacao.solicitacao.ativo,
                dataCadastro: cotacao.solicitacao.dataCadastro,
                produtos: cotacao.produtos,
                subSegmento: cotacao.subSegmento
            }
        }

        function listarCotacoes(response) {
            //CotacoesService.query().$promise.then(function (response) {
                for (var i = 0; i < response.length; i++) {
                    //if (response[i].solicitacao._id === $stateParams.solicitacaoId) {
                        if (response[i].user._id === vm.authentication.user._id)
                            var cotacao = response[i];
                        else {
                            //vm.cotacoes.push(response[i]);

                            for(var j = 0; j < response[i].produtos.length; j++){
                                vm.cotacoes.push({
                                    user: response[i].user,
                                    nome: response[i].produtos[j].nome,
                                    codigo: response[i].produtos[j].codigo,
                                    unidadeMedida: response[i].produtos[j].unidadeMedida,
                                    tipoCotacao: response[i].produtos[j].tipoCotacao,
                                    quantidade: response[i].produtos[j].quantidade,
                                    dataEntrega: response[i].produtos[j].dataEntrega,
                                    imagemURL: response[i].produtos[j].imagemURL,
                                    disponivel: response[i].produtos[j].disponivel,
                                    valor: response[i].produtos[j].valor
                                });
                            }
                        }
                    //}
                }

                if(vm.cotacoes.length > 0)
                    vm.cotacoes = _.groupBy(vm.cotacoes, "nome");
                else
                    vm.cotacoes = {};

                if (cotacao !== undefined) {
                    obterDadosSolicitacao(cotacao);

                    vm.solicitacao = cotacao;
                    vm.solicitacao.dataCadastro = cotacao.solicitacao.dataCadastro;
                    vm.solicitacao.ativo = cotacao.solicitacao.ativo;
                    vm.solicitacao.subSegmento = cotacao.subSegmento;

                    vm.cotacao = new CotacoesService(cotacao);
                }
            //});
        }

        function init(){
            cotacoesApiService.obterPorSolicitacaoId($stateParams.solicitacaoId).success(function (response) {
                listarCotacoes(response);
            }).error(function (response) {
                // Show user error message and clear form
            });

            //listarCotacoes();
        }

        init();
    }
})();
