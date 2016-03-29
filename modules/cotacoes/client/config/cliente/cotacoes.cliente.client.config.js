(function () {
    'use strict';

    angular
        .module('cotacoes')
        .run(menuConfig);

    menuConfig.$inject = ['Menus'];

    function menuConfig(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', {
            title: 'Cliente',
            state: 'cotacoesCliente',
            type: 'dropdown',
            roles: ['cliente']
        });

        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'cotacoesCliente', {
            title: 'Minhas Cotações',
            state: 'cotacoesCliente.list',
            roles: ['cliente']
        });

        Menus.addSubMenuItem('topbar', 'cotacoesCliente', {
            title: 'Nova Cotacao',
            state: 'cotacoesCliente.create',
            roles: ['cliente']
        });
    }
})();
