(function() {
    'use strict';

    angular
        .module('cotacoes')
        .controller('SegmentosFornecedorController', SegmentosFornecedorController);

    SegmentosFornecedorController.$inject = ['$scope', 'SegmentosService', 'SubsegmentosService', 'Users', 'Authentication', '$timeout'];

    function SegmentosFornecedorController($scope, SegmentosService, SubsegmentosService, Users, Authentication, $timeout) {
        var vm = this;

        vm.user = Authentication.user;
        vm.usuario = {};
        vm.usuario.segmentos = [];
        vm.usuario.subSegmentos = [];

        vm.subSegmentos = [];

        vm.configuracoesSegmento = {
            enableSearch: true,
            scrollableHeight: '250px',
            scrollable: true
        };

        vm.configuracoesSubSegmento = {
            enableSearch: true,
            scrollableHeight: '250px',
            scrollable: true
        };

        vm.eventosSegmento = {
            onItemSelect: function(segmento) {
                filtrarSubSegmentosPorSegmento(segmento);
            },
            onItemDeselect: function(segmento) {
                retirarSubSegmentoPorSegmento(segmento);
            },
            onSelectAll: function(){
                vm.subSegmentos = [];
            },
            onDeselectAll: function(){
                vm.subSegmentos = [];
                vm.usuario.subSegmentos = [];
            }
        };

        function filtrarSubSegmentosPorSegmento(segmento){
            if(segmento === undefined)
                return;

            vm.subSegmentosQuery.forEach(function(subSegmento){
                if(subSegmento.segmento._id === segmento._id)
                    vm.subSegmentos.push(subSegmento);
            });
        }

        function retirarSubSegmentoPorSegmento(segmento){
            var listaAtualSubSegmentos = angular.copy(vm.subSegmentos);

            if(segmento === undefined)
                return;

            listaAtualSubSegmentos.forEach(function(subSegmento){
                if(subSegmento.segmento._id === segmento._id) {
                    /* jshint ignore:start */
                    var posicao = vm.subSegmentos.indexOf(_.find(vm.subSegmentos, {_id: subSegmento._id}));
                    vm.subSegmentos.splice(posicao, 1);
                    vm.usuario.subSegmentos = _.reject(vm.usuario.subSegmentos, {_id: subSegmento._id});
                    /* jshint ignore:end */
                }
            });

            if(vm.subSegmentos.length <= 0)
                vm.usuario.subSegmentos = [];

        }

        function listarSegmentosESubSegmentos(usuario){
            vm.listaSegmentos = [];

            usuario.subSegmentos.forEach(function(subSegmento){
                vm.listaSegmentos.push(_.find(vm.subSegmentosQuery, {_id: subSegmento}));
            });
        }

        // Save User
        vm.save = function(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.segmentoForm');
                return false;
            }

            var user = new Users(vm.usuario);
            /* jshint ignore:start */
            user.subSegmentos = _.pluck(vm.usuario.subSegmentos, '_id');
            /* jshint ignore:end */

            user.$update(successCallback, errorCallback);

            function successCallback(response) {
                /* jshint ignore:start */
                toastr.success('Salvo com sucesso');
                /* jshint ignore:end */

                Authentication.user = response;
                listarSegmentosESubSegmentos(response);
            }

            function errorCallback(response) {
                vm.error = response.data.message;
            }
        };

        vm.remover = function(){
            var user = new Users(vm.usuario);

            user.subSegmentos = [];
            user.$update(successCallback, errorCallback);

            function successCallback(response) {
                /* jshint ignore:start */
                toastr.success('Removido com sucesso');
                /* jshint ignore:end */

                Authentication.user = response;
                listarSegmentosESubSegmentos(response);
            }

            function errorCallback(response) {
                vm.error = response.data.message;
            }
        }

        init();

        function init() {
            SegmentosService.query().$promise.then(function(response) {
                vm.segmentos = response;
            });

            SubsegmentosService.query().$promise.then(function(response) {
                vm.subSegmentosQuery =  response;

                listarSegmentosESubSegmentos(vm.user);
            });

        }
    }
})();
