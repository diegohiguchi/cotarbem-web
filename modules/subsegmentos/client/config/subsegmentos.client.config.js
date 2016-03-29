(function () {
  'use strict';

  angular
    .module('subsegmentos')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Sub-Segmentos',
      state: 'subsegmentos',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'subsegmentos', {
      title: 'Listar Sub-Segmentos',
      state: 'subsegmentos.list',
      roles: ['admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'subsegmentos', {
      title: 'Criar Sub-Segmento',
      state: 'subsegmentos.create',
      roles: ['admin']
    });
  }
})();
