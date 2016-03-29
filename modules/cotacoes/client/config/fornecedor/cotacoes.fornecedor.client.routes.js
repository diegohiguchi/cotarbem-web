(function () {
    'use strict';

    angular
        .module('cotacoes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('cotacoesFornecedor', {
                abstract: true,
                url: '/cotacoes/fornecedor',
                template: '<ui-view/>'
            })
            .state('cotacoesFornecedor.list', {
                url: '',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/list-cotacoes.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorListController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Minhas Cotações'
                }
            })
           /* .state('cotacoesFornecedor.listEmAndamento', {
                url: '/andamento',
                templateUrl: 'modules/cotacoes/client/views/list-cotacoesEmAndamento.client.view.html',
                controller: 'CotacoesListEmAndamentoController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Listar Cotações Em Andamento'
                }
            })*/
            /*.state('cotacoesFornecedor.emAndamentoView', {
                url: '/andamento/:solicitacaoId',
                templateUrl: 'modules/cotacoes/client/views/view-cotacaoEmAndamento.client.view.html',
                controller: 'CotacaoEmAndamentoController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getCotacaoEmAndamento
                },
                data:{
                    roles: ['admin', 'fornecedor'],
                    pageTitle: 'Cotacao {{ articleResolve.name }}'
                }
            })*/
            .state('cotacoesFornecedor.create', {
                url: '/create',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/form-cotacao.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: newCotacao
                },
                data: {
                    roles: ['admin', 'fornecedor'],
                    pageTitle : 'Cotar'
                }
            })
            .state('cotacoesFornecedor.edit', {
                url: '/:cotacaoId/edit',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/form-cotacao.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getCotacao
                },
                data: {
                    roles: ['admin', 'fornecedor'],
                    pageTitle: 'Editar Cotação {{ cotacaoResolve.name }}'
                }
            })
            .state('cotacoesFornecedor.view', {
                url: '/:solicitacaoId',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/view-cotacao.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getSolicitacao
                },
                data:{
                    pageTitle: 'Cotacao {{ articleResolve.name }}'
                }
            });
    }

    getCotacao.$inject = ['$stateParams', 'CotacoesService'];

    function getCotacao($stateParams, CotacoesService) {
        return CotacoesService.get({
            cotacaoId: $stateParams.cotacaoId
        }).$promise;
    }

    getSolicitacao.$inject = ['$stateParams', 'SolicitacoesService'];

    function getSolicitacao($stateParams, SolicitacoesService) {
        return SolicitacoesService.get({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    newCotacao.$inject = ['CotacoesService'];

    function newCotacao(CotacoesService) {
        return new CotacoesService();
    }
})();
