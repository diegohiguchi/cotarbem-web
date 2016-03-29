(function () {
  'use strict';

  angular
    .module('subsegmentos')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('subsegmentos', {
        abstract: true,
        url: '/subsegmentos',
        template: '<ui-view/>'
      })
      .state('subsegmentos.list', {
        url: '',
        templateUrl: 'modules/subsegmentos/client/views/list-subsegmentos.client.view.html',
        controller: 'SubsegmentosListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Subsegmentos List'
        }
      })
      .state('subsegmentos.create', {
        url: '/create',
        templateUrl: 'modules/subsegmentos/client/views/form-subsegmento.client.view.html',
        controller: 'SubsegmentosController',
        controllerAs: 'vm',
        resolve: {
          subsegmentoResolve: newSubsegmento
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Subsegmentos Create'
        }
      })
      .state('subsegmentos.edit', {
        url: '/:subsegmentoId/edit',
        templateUrl: 'modules/subsegmentos/client/views/form-subsegmento.client.view.html',
        controller: 'SubsegmentosController',
        controllerAs: 'vm',
        resolve: {
          subsegmentoResolve: getSubsegmento
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Subsegmento {{ subsegmentoResolve.name }}'
        }
      })
      .state('subsegmentos.view', {
        url: '/:subsegmentoId',
        templateUrl: 'modules/subsegmentos/client/views/view-subsegmento.client.view.html',
        controller: 'SubsegmentosController',
        controllerAs: 'vm',
        resolve: {
          subsegmentoResolve: getSubsegmento
        },
        data:{
          pageTitle: 'Subsegmento {{ articleResolve.name }}'
        }
      });
  }

  getSubsegmento.$inject = ['$stateParams', 'SubsegmentosService'];

  function getSubsegmento($stateParams, SubsegmentosService) {
    return SubsegmentosService.get({
      subsegmentoId: $stateParams.subsegmentoId
    }).$promise;
  }

  newSubsegmento.$inject = ['SubsegmentosService'];

  function newSubsegmento(SubsegmentosService) {
    return new SubsegmentosService();
  }
})();
