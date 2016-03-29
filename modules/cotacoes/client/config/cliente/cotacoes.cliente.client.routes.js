(function () {
    'use strict';

    angular
        .module('cotacoes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('cotacoesCliente', {
                abstract: true,
                url: '/cliente/cotacoes',
                template: '<ui-view/>'
            })
          /*  .state('cotacoesCliente.list', {
                url: '',
                templateUrl: 'modules/cotacoes/client/views/cliente/list-cotacoes.cliente.client.view.html',
                controller: 'CotacoesListController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Minhas Cotações'
                }
            })*/
            .state('cotacoesCliente.list', {
                url: '',
                templateUrl: 'modules/cotacoes/client/views/cliente/solicitacoes/list-solicitacoes.cliente.client.view.html',
                controller: 'SolicitacoesListController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Minhas Cotações'
                }
            })
            .state('cotacoesCliente.create', {
                url: '/create',
                templateUrl: 'modules/cotacoes/client/views/cliente/solicitacoes/form-solicitacao-cliente.client.view.html',
                controller: 'SolicitacoesController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: newSolicitaco
                },
                data: {
                    roles: ['admin', 'cliente'],
                    pageTitle : 'Cotar'
                }
            })
            .state('cotacoesCliente.edit', {
                url: '/:solicitacaoId/edit',
                templateUrl: 'modules/cotacoes/client/views/cliente/form-solicitacao.cliente.client.view.html',
                controller: 'SolicitacoesController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getSolicitacao
                },
                data: {
                    roles: ['admin', 'cliente'],
                    pageTitle: 'Editar Solicitação {{ cotacaoResolve.name }}'
                }
            })
            .state('cotacoesCliente.view', {
                url: '/solicitacao/:solicitacaoId',
                templateUrl: 'modules/cotacoes/client/views/cliente/view-cotacoes.cliente.client.view.html',
                controller: 'CotacoesClienteController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getSolicitacao
                },
                data:{
                    pageTitle: 'Solicitacao {{ articleResolve.name }}'
                }
            });
    }

    getCotacao.$inject = ['$stateParams', 'CotacoesSolicitacaoService'];

    function getCotacao($stateParams, CotacoesSolicitacaoService) {
        return CotacoesSolicitacaoService.query({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    getCotacaoEmAndamento.$inject = ['$stateParams', 'SolicitacoesService'];

    function getCotacaoEmAndamento($stateParams, SolicitacoesService) {
        return SolicitacoesService.get({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    getSolicitacao.$inject = ['$stateParams', 'SolicitacoesService'];

    function getSolicitacao($stateParams, SolicitacoesService) {
        return SolicitacoesService.get({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    newSolicitaco.$inject = ['SolicitacoesService'];

    function newSolicitaco(SolicitacoesService) {
        return new SolicitacoesService();
    }

})();
