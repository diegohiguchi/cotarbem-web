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
        vm.dadosExcel = [];
        vm.solicitacao = cotacaoResolve;
        vm.error = null;
        vm.form = {};
        vm.total = 0;
        vm.remove = remove;
        vm.save = save;

        vm.marcaTodosItens = function () {
            vm.produtosSelecionados = [];
            vm.total = 0;

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
                });
            });
        };

        function montarExcel(){
            vm.dadosExcel = [];
            var produtos = ['Nome da Empresa', 'Nome do Produto', 'Código', 'Undiade de Medida', 'Quantidade', 'Data de Entrega',
                'Disponível', 'Valor', 'Valor Total'];
            vm.dadosExcel.push(produtos);

            vm.produtosSelecionados.forEach(function(produto){
                produtos = [produto.user.displayName, produto.nome, produto.codigo, produto.unidadeMedida, produto.quantidade,
                    produto.dataEntrega, (produto.disponivel === true ? 'Sim' : 'Não'), produto.valor, (produto.quantidade * produto.valor)];
                vm.dadosExcel.push(produtos);
            });
        }

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

        vm.exportarExcel = function(){

            montarExcel();

            function datenum(v, date1904) {
                if(date1904) v+=1462;
                var epoch = Date.parse(v);
                return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
            }

            function sheet_from_array_of_arrays(data, opts) {
                var ws = {};
                var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
                for(var R = 0; R != data.length; ++R) {
                    for(var C = 0; C != data[R].length; ++C) {
                        if(range.s.r > R) range.s.r = R;
                        if(range.s.c > C) range.s.c = C;
                        if(range.e.r < R) range.e.r = R;
                        if(range.e.c < C) range.e.c = C;
                        var cell = {v: data[R][C] };
                        if(cell.v == null) continue;
                        var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

                        if(typeof cell.v === 'number') cell.t = 'n';
                        else if(typeof cell.v === 'boolean') cell.t = 'b';
                        else if(cell.v instanceof Date) {
                            cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                            cell.v = datenum(cell.v);
                        }
                        else cell.t = 's';

                        ws[cell_ref] = cell;
                    }
                }
                if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                return ws;
            }

            /* original data */
            /* var data = [[1,2,3],[true, false, null, "sheetjs"],["foo","bar",new Date("2014-02-19T14:30Z"), "0.3"], ["baz", null, "qux"]]*/

            var data = vm.dadosExcel;
            var ws_name = "Cotação - " + vm.solicitacao.subSegmento.nome;

            function Workbook() {
                if(!(this instanceof Workbook)) return new Workbook();
                this.SheetNames = [];
                this.Sheets = {};
            }

            var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

            /* add worksheet to workbook */
            wb.SheetNames.push(ws_name);
            wb.Sheets[ws_name] = ws;
            var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});

            function s2ab(s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }

            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "cotacao.xlsx")
        }


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
