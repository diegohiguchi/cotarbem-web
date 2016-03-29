(function () {
  'use strict';

  angular
    .module('cotacoes')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Fornecedor',
      state: 'cotacoesFornecedor',
      type: 'dropdown',
      roles: ['fornecedor']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'cotacoesFornecedor', {
      title: 'Minhas Cotações',
      state: 'cotacoesFornecedor.list',
      roles: ['fornecedor']
    });

    // Add the dropdown list item
   /* Menus.addSubMenuItem('topbar', 'cotacoesFornecedor', {
      title: 'Listar Cotações Em Andamento',
      state: 'cotacoesFornecedor.listEmAndamento',
      roles: ['cliente', 'fornecedor']
    });*/
  }
})();
