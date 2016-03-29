(function () {
    'use strict';

    angular
        .module('solicitacoes')
        .filter('semData', function () {
            return function (data) {
                return data === undefined ? '-' : data;
            };
        })
        .filter('status', function () {
            return function (data) {
                return data === true ? 'Em andamento ' : 'Encerrado';
            };
        })
        .filter('isEmpty', [function () {
            return function (object) {
                return angular.equals({}, object);
            }
        }]);
})();
