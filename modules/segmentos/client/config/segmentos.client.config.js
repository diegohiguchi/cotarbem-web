(function () {
  'use strict';

  angular
    .module('segmentos')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Segmentos',
      state: 'segmentos',
      type: 'dropdown',
      roles: ['admin', 'fornecedor']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'segmentos', {
      title: 'Listar Segmentos',
      state: 'segmentos.list',
      roles: ['admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'segmentos', {
      title: 'Criar Segmento',
      state: 'segmentos.create',
      roles: ['admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'segmentos', {
      title: 'Adicionar Segmentos/Sub-Segmentos',
      state: 'segmentos.adicionar',
      roles: ['admin', 'fornecedor']
    });
  }
})();
