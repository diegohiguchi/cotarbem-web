//Cotacoes service used to communicate Cotacoes REST endpoints
(function () {
  'use strict';

  angular
      .module('cotacoes')
      .factory('CotacoesService', CotacoesService);

  CotacoesService.$inject = ['$resource'];

  function CotacoesService($resource) {
    return $resource('api/cotacoes/:cotacaoId', {
      cotacaoId: '@_id'
    }, {
      update: {
        method: 'PUT',
      }
    });
  }

  angular.module('cotacoes').factory('cotacoesApiService', ['$http', cotacoesApiService]);

  function cotacoesApiService($http) {

    function obterPorSolicitacaoId(id) {
      return $http.get('/api/cotacoes/obterPorSolicitacaoId/' + id);
    }

    function exportarParaExcel(produtos) {
      return $http.post('/api/cotacoes/exportarParaExcel', produtos);
    }

    var services = {
      obterPorSolicitacaoId: obterPorSolicitacaoId,
      exportarParaExcel: exportarParaExcel
    };

    return services;
  }
    /*angular
        .module('cotacoes')
        .factory('CotacoesPorSolicitacaoService', CotacoesPorSolicitacaoService);

    CotacoesPorSolicitacaoService.$inject = ['$resource'];

    function CotacoesPorSolicitacaoService($resource) {
        return $resource('api/cotacoes/solicitacao/:solicitacaoId', {
            solicitacaoId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }*/
})();
