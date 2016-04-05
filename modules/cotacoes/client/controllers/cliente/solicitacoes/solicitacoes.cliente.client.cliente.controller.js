(function () {
    'use strict';

    // Solicitacoes controller
    angular
        .module('solicitacoes')
        .controller('SolicitacoesController', SolicitacoesController);

    SolicitacoesController.$inject = ['$scope', '$state', 'Authentication', 'cotacaoResolve', 'SegmentosService',
        'SubsegmentosService', 'notificacoesApiService', 'Socket', '$timeout', '$window', 'FileUploader', 'solicitacoesApiService'];

    function SolicitacoesController ($scope, $state, Authentication, solicitacoes, SegmentosService, SubsegmentosService,
                                     notificacoesApiService, Socket, $timeout, $window, FileUploader, solicitacoesApiService) {

        var vm = this;
        vm.authentication = Authentication;
        vm.segmentos = SegmentosService.query();
        vm.subSegmentosQuery = SubsegmentosService.query();
        vm.solicitacao = solicitacoes;
        vm.error = null;
        vm.form = {};
        vm.produto = {};
        vm.remove = remove;
        vm.save = save;
        vm.tipoCotacao = [
            'Unidade',
            'Caixa',
        ];
        vm.solicitacao.produtos = vm.solicitacao.produtos === undefined ? [] : vm.solicitacao.produtos;

        vm.filtrarSubSegmentosPorSegmento = function(modelSegmento){
            vm.subSegmentos = [];

            if(modelSegmento === undefined)
                return;

            vm.subSegmentosQuery.forEach(function(subSegmento){
                if(subSegmento.segmento._id === modelSegmento._id)
                    vm.subSegmentos.push(subSegmento);
            });
        };

        vm.adicionarProduto = function(produto) {
            if(produto === null || produto === undefined || (produto.nome === undefined || produto.nome === '') ||
                produto.unidadeMedida === undefined || produto.quantidade === undefined ) {
                /* jshint ignore:start */
                toastr.error('Preencha os campos com asterisco (*) do novo produto');
                /* jshint ignore:end */

                return;
            }

            vm.produto = {};
            vm.solicitacao.produtos.push(produto);
            //vm.uploader.clearQueue();
            //vm.produto.imagemURL = '';
        };

        vm.removerProduto = function(produto){
            var posicao = vm.solicitacao.produtos.indexOf(produto);
            vm.solicitacao.produtos.splice(posicao, 1);
        };

        vm.editarProduto = function (produto) {
            var posicao = vm.solicitacao.produtos.indexOf(produto);
            vm.solicitacao.produtos.splice(posicao, 1);
            vm.produto = produto;
            vm.produto.posicao = posicao;
            vm.edicao = true;
        };

        vm.salvarEdicao = function(produto){
            vm.solicitacao.produtos.splice(produto.posicao, 0, produto);
            vm.produto = null;
            vm.edicao = false;
        };

        vm.cancelarEdicao = function (produto){
            vm.solicitacao.produtos.splice(produto.posicao, 0, produto);
            vm.produto = null;
            vm.edicao = false;
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

            else if(vm.solicitacao.produtos.length <= 0) {
                /* jshint ignore:start */
                toastr.error('Adicione pelo menos um produto');
                /* jshint ignore:end */

                return false;
            }

            vm.solicitacao.tempo = vm.solicitacao.tempoCotacao;

            // TODO: move create/update logic to service
            if (vm.solicitacao._id) {
                vm.solicitacao.$update(successCallback, errorCallback);
            } else {
                vm.solicitacao.$save(successCallback, errorCallback);
            }

            function successCallback(response) {
                var solicitacao = {
                    _id: response._id,
                    subSegmento: response.subSegmento
                };

                debugger
                vm.uploader.onBeforeUploadItem = function(item){
                    item.formData = [solicitacao];
                };

                if(vm.uploader.queue.length > 0)
                    vm.uploader.uploadAll();
                else
                    notificarFornecedores(response);
            }

            function errorCallback(response) {
                vm.error = response.data.message;
            }
        }

        function notificarFornecedores(solicitacao){
            Socket.emit('nova-solicitacao', solicitacao);

            notificacoesApiService.notificarFornecedores(solicitacao).success(function(response){
                /* jshint ignore:start */
                toastr.success('Solicitação enviada com sucesso');
                /* jshint ignore:end */
                $state.go('cotacoesCliente.list');
            });
        }

        // Create file uploader instance
        vm.uploader = new FileUploader({
            url: '/api/solicitacoes/cliente/uploadImages',
            alias: 'novaImagemProduto'
        });

        // Set file uploader image filter
        vm.uploader.filters.push({
            name: 'imageFilter',
            fn: function (item, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // Called after the user selected a new picture file
        vm.uploader.onAfterAddingFile = function (fileItem) {
            if ($window.FileReader) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(fileItem._file);

                fileReader.onload = function (fileReaderEvent) {
                    $timeout(function () {
                        vm.produto.imagemURL = fileReaderEvent.target.result;
                    }, 0);
                };
            }
        };

        // Called after the user has successfully uploaded a new picture
        vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
            // Show success message
            //$scope.success = true;

            // Clear upload buttons
            vm.cancelUpload();

            notificarFornecedores(response);
        };

        // Called after the user has failed to uploaded a new picture
        vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
            // Clear upload buttons
            vm.cancelUpload();

            // Show error message
            $scope.error = response.message;
        };

        // Change user profile picture
        vm.uploadProfilePicture = function () {

            // Clear messages
            $scope.success = $scope.error = null;

            // Start upload
            vm.uploader.uploadAll();
        };

        // Cancel the upload process
        vm.cancelUpload = function () {
            vm.uploader.clearQueue();
            vm.produto.imagemURL = '';
        };

        vm.cancelar = function () {
            vm.produto.imagemURL = '';
        };
    }
})();
