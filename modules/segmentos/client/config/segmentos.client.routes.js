(function () {
  'use strict';

  angular
    .module('segmentos')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('segmentos', {
        abstract: true,
        url: '/segmentos',
        template: '<ui-view/>'
      })
      .state('segmentos.list', {
        url: '',
        templateUrl: 'modules/segmentos/client/views/list-segmentos.client.view.html',
        controller: 'SegmentosListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Segmentos List'
        }
      })
      .state('segmentos.create', {
          url: '/create',
          templateUrl: 'modules/segmentos/client/views/form-segmento.client.view.html',
          controller: 'SegmentosController',
          controllerAs: 'vm',
          resolve: {
            segmentoResolve: newSegmento
          },
          data: {
            roles: ['user', 'admin'],
            pageTitle : 'Segmentos Create'
          }
        })
        .state('segmentos.adicionar', {
          url: '/fornecedor/adicionar',
          templateUrl: 'modules/segmentos/client/views/fornecedor/form-segmento.fornecedor.client.view.html',
          controller: 'SegmentosFornecedorController',
          controllerAs: 'vm',
          resolve: {
            segmentoResolve: newSegmento
          },
          data: {
            roles: ['admin', 'fornecedor'],
            pageTitle : 'Segmentos Fornecedor'
          }
        })
      .state('segmentos.edit', {
        url: '/:segmentoId/edit',
        templateUrl: 'modules/segmentos/client/views/form-segmento.client.view.html',
        controller: 'SegmentosController',
        controllerAs: 'vm',
        resolve: {
          segmentoResolve: getSegmento
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Segmento {{ segmentoResolve.name }}'
        }
      })
      .state('segmentos.view', {
        url: '/:segmentoId',
        templateUrl: 'modules/segmentos/client/views/view-segmento.client.view.html',
        controller: 'SegmentosController',
        controllerAs: 'vm',
        resolve: {
          segmentoResolve: getSegmento
        },
        data:{
          pageTitle: 'Segmento {{ articleResolve.name }}'
        }
      });
  }

  getSegmento.$inject = ['$stateParams', 'SegmentosService'];

  function getSegmento($stateParams, SegmentosService) {
    return SegmentosService.get({
      segmentoId: $stateParams.segmentoId
    }).$promise;
  }

  newSegmento.$inject = ['SegmentosService'];

  function newSegmento(SegmentosService) {
    return new SegmentosService();
  }
})();
