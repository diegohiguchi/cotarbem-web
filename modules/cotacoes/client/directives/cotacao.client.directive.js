(function () {
    'use strict';

    var app = angular.module('cotacoes');

    app.directive('myCurrentTime', ['$interval', 'dateFilter', 'SolicitacoesService', 'notificacoesApiService',
        'Socket', 'Authentication',
        function ($interval, dateFilter, SolicitacoesService, notificacoesApiService, Socket, Authentication) {
            // return the directive link function. (compile function not needed)
            return function (scope, element, attrs) {
                var format = 'mm:ss a',  // date format
                    stopTime,
                    solicitacao,
                    contador; // so that we can cancel the time updates

                function updateTime() {

                    var novaData = new Date();
                    novaData = moment(novaData).format('DD/MM/YYYY HH:mm:ss');
                    var dataSolicitacao = moment.utc(solicitacao.dataCadastro, "YYYY-MM-DD HH:mm:ss").local();

                    var diferencaData = moment.utc(moment(novaData, "DD/MM/YYYY  HH:mm:ss").diff(moment(dataSolicitacao, "DD/MM/YYYY  HH:mm:ss"))).format("HH:mm:ss");
                    var tempoEmSegundos = moment.duration(diferencaData).asSeconds();

                    //if (tempoEmSegundos <= 600) {
                    if (tempoEmSegundos <= 10) {
                        var intervaloData = moment.utc(moment(dataSolicitacao, "DD/MM/YYYY  HH:mm:ss").diff(moment(novaData, "DD/MM/YYYY HH:mm:ss"))).local().format("HH:mm:ss");
                        contador = moment.utc(moment(intervaloData, "HH:mm:ss").diff(moment("23:50:00", "HH:mm:ss"))).format("mm:ss");
                        /*
                         var progressBar = element.parent().find('div')[0];

                         if (progressBar != undefined) {
                         progressBar.style.width = (100 - ((tempoEmSegundos * 100) / 600)) + "%";
                         }*/

                    } else if (solicitacao.ativo) {

                        SolicitacoesService.get({
                            solicitacaoId: solicitacao._id
                        }).$promise.then(function (response) {
                            $interval.cancel(stopTime);
                            solicitacao = response;
                            solicitacao.ativo = false;
                            solicitacao.$update();

                            var solicitacaoEncerrada = {
                                _id: solicitacao._id,
                                user: user
                            };

                            notificacoesApiService.notificarCliente(solicitacaoEncerrada).success(function (response) {
                            });

                            Socket.emit('cotacao-encerrada', solicitacao);
                        });

                        /*services.solicitacaoServices.editar(solicitacao).success(function (response) {
                         $interval.cancel(stopTime);
                         }).then(function () {
                         var device = {};
                         device = {
                         usuarioId: solicitacao.usuarioId,
                         titulo: 'Cotar Bem',
                         mensagem: 'Cotação encerrada'
                         }

                         services.deviceTokenServices.notificar(device).success(function (response) {
                         });

                         solicitacao.url = "app/cotacao/solicitacao/produto/notificacao/solicitacaoId?id=";

                         socket.emit('cotacao-encerrada', solicitacao);
                         });*/

                    } else {
                        $interval.cancel(stopTime);
                    }

                    element.text(dateFilter(contador, format));
                }

                // watch the expression, and update the UI on change.
                scope.$watch(attrs.myCurrentTime, function (value) {
                    ///format = value;
                    solicitacao = value;
                    updateTime();
                });

                stopTime = $interval(updateTime, 1000);

                // listen on DOM destroy (removal) event, and cancel the next UI update
                // to prevent updating time after the DOM element was removed.
                element.on('$destroy', function () {
                    $interval.cancel(stopTime);
                });
            }
        }]);
})();
