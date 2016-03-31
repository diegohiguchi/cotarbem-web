//Solicitacoes service used to communicate Solicitacoes REST endpoints
(function () {
    'use strict';

    angular
        .module('solicitacoes')
        .factory('SolicitacoesService', SolicitacoesService);

    SolicitacoesService.$inject = ['$resource'];

    function SolicitacoesService($resource) {
        return $resource('api/solicitacoes/:solicitacaoId', {
            solicitacaoId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }

    angular.module('solicitacoes').factory('SolicitacoesSegmentoService', ['$resource',
        function ($resource) {
            return $resource('api/solicitacoesPorSubSegmentos', {
            });
        }
    ]);

   /* angular.module('solicitacoes').factory('CotacoesPorSolicitacaoService', ['$resource',
        function ($resource) {
            return $resource('api/cotacoes/solicitacao/:solicitacaoId', {
                solicitacaoId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ]);*/
})();
