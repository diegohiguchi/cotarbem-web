//Cotacoes service used to communicate Cotacoes REST endpoints
(function () {
  'use strict';

  angular.module('notificacoes').factory('notificacoesApiService', ['$http', notificacoesApiService]);

  function notificacoesApiService($http) {

    function notificarFornecedores(solicitacao) {
      return $http.post('/api/notificacao/fornecedores', solicitacao);
    }

    function notificarCliente(solicitacao) {
      return $http.post('/api/notificacao/cliente', solicitacao);
    }

    function notificarFornecedoresProdutos(solicitacao) {
      return $http.post('/api/notificacao/fornecedores/produtos', solicitacao);
    }

    var services = {
      notificarFornecedores: notificarFornecedores,
      notificarCliente: notificarCliente,
      notificarFornecedoresProdutos: notificarFornecedoresProdutos
    };

    return services;
  }
})();
