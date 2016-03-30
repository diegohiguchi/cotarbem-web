'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils',
    'angularFileUpload', 'angularjs-dropdown-multiselect', 'ui.utils.masks', 'angular-loading-bar'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
    'cfpLoadingBarProvider',
  function ($locationProvider, $httpProvider, cfpLoadingBarProvider) {

    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

(function (app) {
  'use strict';

  app.registerModule('cotacoes');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('notificacoes');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('solicitacoes');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('segmentos');
})(ApplicationConfiguration);

(function (app) {
  'use strict';

  app.registerModule('subsegmentos');
})(ApplicationConfiguration);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

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

(function () {
    'use strict';

    angular
        .module('cotacoes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('cotacoesCliente', {
                abstract: true,
                url: '/cliente/cotacoes',
                template: '<ui-view/>'
            })
          /*  .state('cotacoesCliente.list', {
                url: '',
                templateUrl: 'modules/cotacoes/client/views/cliente/list-cotacoes.cliente.client.view.html',
                controller: 'CotacoesListController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Minhas Cotações'
                }
            })*/
            .state('cotacoesCliente.list', {
                url: '',
                templateUrl: 'modules/cotacoes/client/views/cliente/solicitacoes/list-solicitacoes.cliente.client.view.html',
                controller: 'SolicitacoesListController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Minhas Cotações'
                }
            })
            .state('cotacoesCliente.create', {
                url: '/create',
                templateUrl: 'modules/cotacoes/client/views/cliente/solicitacoes/form-solicitacao-cliente.client.view.html',
                controller: 'SolicitacoesController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: newSolicitaco
                },
                data: {
                    roles: ['admin', 'cliente'],
                    pageTitle : 'Cotar'
                }
            })
            .state('cotacoesCliente.edit', {
                url: '/:solicitacaoId/edit',
                templateUrl: 'modules/cotacoes/client/views/cliente/form-solicitacao.cliente.client.view.html',
                controller: 'SolicitacoesController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getSolicitacao
                },
                data: {
                    roles: ['admin', 'cliente'],
                    pageTitle: 'Editar Solicitação {{ cotacaoResolve.name }}'
                }
            })
            .state('cotacoesCliente.view', {
                url: '/solicitacao/:solicitacaoId',
                templateUrl: 'modules/cotacoes/client/views/cliente/view-cotacoes.cliente.client.view.html',
                controller: 'CotacoesClienteController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getSolicitacao
                },
                data:{
                    pageTitle: 'Solicitacao {{ articleResolve.name }}'
                }
            });
    }

    getCotacao.$inject = ['$stateParams', 'CotacoesSolicitacaoService'];

    function getCotacao($stateParams, CotacoesSolicitacaoService) {
        return CotacoesSolicitacaoService.query({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    getCotacaoEmAndamento.$inject = ['$stateParams', 'SolicitacoesService'];

    function getCotacaoEmAndamento($stateParams, SolicitacoesService) {
        return SolicitacoesService.get({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    getSolicitacao.$inject = ['$stateParams', 'SolicitacoesService'];

    function getSolicitacao($stateParams, SolicitacoesService) {
        return SolicitacoesService.get({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    newSolicitaco.$inject = ['SolicitacoesService'];

    function newSolicitaco(SolicitacoesService) {
        return new SolicitacoesService();
    }

})();

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

(function () {
    'use strict';

    angular
        .module('cotacoes')
        .config(routeConfig);

    routeConfig.$inject = ['$stateProvider'];

    function routeConfig($stateProvider) {
        $stateProvider
            .state('cotacoesFornecedor', {
                abstract: true,
                url: '/cotacoes/fornecedor',
                template: '<ui-view/>'
            })
            .state('cotacoesFornecedor.list', {
                url: '',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/list-cotacoes.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorListController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Minhas Cotações'
                }
            })
           /* .state('cotacoesFornecedor.listEmAndamento', {
                url: '/andamento',
                templateUrl: 'modules/cotacoes/client/views/list-cotacoesEmAndamento.client.view.html',
                controller: 'CotacoesListEmAndamentoController',
                controllerAs: 'vm',
                data: {
                    pageTitle: 'Listar Cotações Em Andamento'
                }
            })*/
            /*.state('cotacoesFornecedor.emAndamentoView', {
                url: '/andamento/:solicitacaoId',
                templateUrl: 'modules/cotacoes/client/views/view-cotacaoEmAndamento.client.view.html',
                controller: 'CotacaoEmAndamentoController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getCotacaoEmAndamento
                },
                data:{
                    roles: ['admin', 'fornecedor'],
                    pageTitle: 'Cotacao {{ articleResolve.name }}'
                }
            })*/
            .state('cotacoesFornecedor.create', {
                url: '/create',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/form-cotacao.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: newCotacao
                },
                data: {
                    roles: ['admin', 'fornecedor'],
                    pageTitle : 'Cotar'
                }
            })
            .state('cotacoesFornecedor.edit', {
                url: '/:cotacaoId/edit',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/form-cotacao.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getCotacao
                },
                data: {
                    roles: ['admin', 'fornecedor'],
                    pageTitle: 'Editar Cotação {{ cotacaoResolve.name }}'
                }
            })
            .state('cotacoesFornecedor.view', {
                url: '/:solicitacaoId',
                templateUrl: 'modules/cotacoes/client/views/fornecedor/view-cotacao.fornecedor.client.view.html',
                controller: 'CotacoesFornecedorController',
                controllerAs: 'vm',
                resolve: {
                    cotacaoResolve: getSolicitacao
                },
                data:{
                    pageTitle: 'Cotacao {{ articleResolve.name }}'
                }
            });
    }

    getCotacao.$inject = ['$stateParams', 'CotacoesService'];

    function getCotacao($stateParams, CotacoesService) {
        return CotacoesService.get({
            cotacaoId: $stateParams.cotacaoId
        }).$promise;
    }

    getSolicitacao.$inject = ['$stateParams', 'SolicitacoesService'];

    function getSolicitacao($stateParams, SolicitacoesService) {
        return SolicitacoesService.get({
            solicitacaoId: $stateParams.solicitacaoId
        }).$promise;
    }

    newCotacao.$inject = ['CotacoesService'];

    function newCotacao(CotacoesService) {
        return new CotacoesService();
    }
})();

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
        vm.solicitacao = cotacaoResolve;
        vm.error = null;
        vm.form = {};
        vm.total = 0;
        vm.remove = remove;
        vm.save = save;

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

        function listarCotacoes(response){
            //CotacoesService.query().$promise.then(function(response){
            for(var i = 0; i < response.length; i++){
                /* if(response[i].solicitacao._id === $stateParams.solicitacaoId) {*/
                for(var j = 0; j < response[i].produtos.length; j++){
                    vm.cotacoes.push({
                        user: response[i].user,
                        nome: response[i].produtos[j].nome,
                        tipoCotacao: response[i].produtos[j].tipoCotacao,
                        quantidade: response[i].produtos[j].quantidade,
                        dataEntrega: response[i].produtos[j].dataEntrega,
                        disponivel: response[i].produtos[j].disponivel,
                        valor: response[i].produtos[j].valor
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

(function () {
    'use strict';

    angular
        .module('cotacoes')
        .controller('CotacoesClienteListController', CotacoesClienteListController);

    CotacoesClienteListController.$inject = ['CotacoesService'];

    function CotacoesClienteListController(CotacoesService) {
        var vm = this;

        vm.cotacoes = CotacoesService.query();
    }
})();

(function () {
  'use strict';

  angular
    .module('solicitacoes')
    .controller('SolicitacoesListController', SolicitacoesListController);

  SolicitacoesListController.$inject = ['SolicitacoesService', '$filter'];

  function SolicitacoesListController(SolicitacoesService, $filter ) {
    var vm = this;

    SolicitacoesService.query(function (data) {
      vm.solicitacoes = data;
      vm.buildPager();
    });

    vm.buildPager = function () {
      vm.pagedItems = [];
      vm.itemsPerPage = 5;
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    };

    vm.figureOutItemsToDisplay = function () {
      vm.filteredItems = $filter('filter')(vm.solicitacoes, {
        $: vm.search
      });
      vm.filterLength = vm.filteredItems.length;
      var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
      var end = begin + vm.itemsPerPage;
      vm.pagedItems = vm.filteredItems.slice(begin, end);
    };

    vm.pageChanged = function () {
      vm.figureOutItemsToDisplay();
    };
  }
})();

(function () {
    'use strict';

    // Solicitacoes controller
    angular
        .module('solicitacoes')
        .controller('SolicitacoesController', SolicitacoesController);

    SolicitacoesController.$inject = ['$scope', '$state', 'Authentication', 'cotacaoResolve', 'SegmentosService',
        'SubsegmentosService', 'notificacoesApiService'];

    function SolicitacoesController ($scope, $state, Authentication, solicitacoes, SegmentosService, SubsegmentosService,
        notificacoesApiService) {

        var vm = this;

        vm.authentication = Authentication;
        vm.segmentos = SegmentosService.query();
        vm.subSegmentosQuery = SubsegmentosService.query();
        vm.solicitacao = solicitacoes;
        vm.error = null;
        vm.form = {};
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
                produto.tipoCotacao === undefined || produto.quantidade === undefined ) {
                /* jshint ignore:start */
                toastr.error('Informe o dados do Produto');
                /* jshint ignore:end */

                return;
            }

            vm.produto = null;
            vm.solicitacao.produtos.push(produto);
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

            // TODO: move create/update logic to service
            if (vm.solicitacao._id) {
                vm.solicitacao.$update(successCallback, errorCallback);
            } else {
                vm.solicitacao.$save(successCallback, errorCallback);
            }

            function successCallback(res) {

                var solicitacao = {
                    _id: res._id,
                    subSegmento: res.subSegmento
                };

                notificacoesApiService.notificarFornecedores(solicitacao).success(function(response){
                    /* jshint ignore:start */
                    toastr.success('Solicitação enviada com sucesso');
                    /* jshint ignore:end */
                    $state.go('cotacoesCliente.list');
                });
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }
    }
})();

/*
 (function () {
 'use strict';

 // Cotacoes controller
 angular
 .module('cotacoes')
 .controller('CotacoesFornecedorController', CotacoesFornecedorController);

 CotacoesFornecedorController.$inject = ['$scope', '$state', 'Authentication', 'cotacaoResolve'];

 function CotacoesFornecedorController ($scope, $state, Authentication, cotacao) {
 var vm = this;

 vm.authentication = Authentication;
 vm.cotacao = cotacao;
 vm.error = null;
 vm.form = {};
 vm.remove = remove;
 vm.save = save;

 vm.calcularSomaTotal = function(){
 var total = 0;
 for(var i = 0; i < vm.cotacao.produtos.length; i++){
 var produto = vm.cotacao.produtos[i];
 total += (produto.valor * produto.quantidade);
 }
 return total;
 };

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
 /!* jshint ignore:start *!/
 toastr.success('Salvo com sucesso');
 /!* jshint ignore:end *!/
 $state.go('cotacoesFornecedor.list');
 }

 function errorCallback(res) {
 vm.error = res.data.message;
 }
 }
 }
 })();
 */
(function () {
    'use strict';

    // Solicitacoes controller
    angular
        .module('cotacoes')
        .controller('CotacoesFornecedorController', CotacoesFornecedorController);

    CotacoesFornecedorController.$inject = ['$scope', '$state', 'Authentication', 'CotacoesService',
        'cotacaoResolve',
        '$timeout', '$stateParams', 'cotacoesApiService'];

    function CotacoesFornecedorController ($scope, $state, Authentication, CotacoesService,
                                           cotacao,
                                           $timeout, $stateParams, cotacoesApiService) {

        var vm = this;
        vm.cotacoes = [];
        vm.authentication = Authentication;
        vm.solicitacao = cotacao;
        vm.cotacao = new CotacoesService();
        vm.error = null;
        vm.form = {};
        vm.remove = remove;
        vm.save = save;

        vm.calcularSomaTotal = function(){
            /*  var total = 0;
             for(var i = 0; i < vm.solicitacao.produtos.length; i++){
             var produto = vm.solicitacao.produtos[i];
             total += (produto.valor * produto.quantidade);
             }
             return total;*/
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

            // TODO: move create/update logic to service
            if (vm.cotacao._id) {
                vm.cotacao.produtos = vm.solicitacao.produtos;
                vm.cotacao.$update(successCallback, errorCallback);
            } else {
                vm.cotacao.solicitacao = vm.solicitacao._id;
                vm.cotacao.subSegmento = vm.solicitacao.subSegmento._id;
                vm.cotacao.produtos = vm.solicitacao.produtos;
                vm.cotacao.$save(successCallback, errorCallback);
            }

            function successCallback(res) {
                /* jshint ignore:start */
                toastr.success('Cotação salva com sucesso');
                /* jshint ignore:end */
                $state.go('cotacoesFornecedor.list');
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }

        vm.voltar = function(){
            $state.go('cotacoesFornecedor.list');
        };

        function obterDadosSolicitacao(cotacao){
            vm.solicitacao = {
                _id: cotacao.solicitacao._id,
                ativo: cotacao.solicitacao.ativo,
                dataCadastro: cotacao.solicitacao.dataCadastro,
                produtos: cotacao.produtos,
                subSegmento: cotacao.subSegmento
            }
        }

        function listarCotacoes(response) {
            //CotacoesService.query().$promise.then(function (response) {
                for (var i = 0; i < response.length; i++) {
                    //if (response[i].solicitacao._id === $stateParams.solicitacaoId) {
                        if (response[i].user._id === vm.authentication.user._id)
                            var cotacao = response[i];
                        else {
                            //vm.cotacoes.push(response[i]);

                            for(var j = 0; j < response[i].produtos.length; j++){
                                vm.cotacoes.push({
                                    user: response[i].user,
                                    nome: response[i].produtos[j].nome,
                                    tipoCotacao: response[i].produtos[j].tipoCotacao,
                                    quantidade: response[i].produtos[j].quantidade,
                                    dataEntrega: response[i].produtos[j].dataEntrega,
                                    disponivel: response[i].produtos[j].disponivel,
                                    valor: response[i].produtos[j].valor
                                });
                            }
                        }
                    //}
                }

                if(vm.cotacoes.length > 0)
                    vm.cotacoes = _.groupBy(vm.cotacoes, "nome");
                else
                    vm.cotacoes = {};

                if (cotacao !== undefined) {
                    obterDadosSolicitacao(cotacao);

                    vm.solicitacao = cotacao;
                    vm.solicitacao.dataCadastro = cotacao.solicitacao.dataCadastro;
                    vm.solicitacao.ativo = cotacao.solicitacao.ativo;
                    vm.solicitacao.subSegmento = cotacao.subSegmento;

                    vm.cotacao = new CotacoesService(cotacao);
                }
            //});
        }

        function init(){
            cotacoesApiService.obterPorSolicitacaoId($stateParams.solicitacaoId).success(function (response) {
                listarCotacoes(response);
            }).error(function (response) {
                // Show user error message and clear form
            });

            //listarCotacoes();
        }

        init();
    }
})();

(function () {
    'use strict';

    angular
        .module('cotacoes')
        .controller('CotacoesFornecedorListController', CotacoesFornecedorListController);

    CotacoesFornecedorListController.$inject = ['SolicitacoesSegmentoService', '$filter'];

    function CotacoesFornecedorListController(SolicitacoesSegmentoService, $filter) {
        var vm = this;

        SolicitacoesSegmentoService.query(function (data) {
            vm.solicitacoes = data;
            vm.buildPager();
        });

        vm.buildPager = function () {
            vm.pagedItems = [];
            vm.itemsPerPage = 5;
            vm.currentPage = 1;
            vm.figureOutItemsToDisplay();
        };

        vm.figureOutItemsToDisplay = function () {
            vm.filteredItems = $filter('filter')(vm.solicitacoes, {
                $: vm.search
            });
            vm.filterLength = vm.filteredItems.length;
            var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
            var end = begin + vm.itemsPerPage;
            vm.pagedItems = vm.filteredItems.slice(begin, end);
        };

        vm.pageChanged = function () {
            vm.figureOutItemsToDisplay();
        };
    }
})();


(function () {
    'use strict';

    var app = angular.module('cotacoes');

    app.directive('myCurrentTime', ['$interval', 'dateFilter', 'SolicitacoesService', 'notificacoesApiService',
        function ($interval, dateFilter, SolicitacoesService, notificacoesApiService) {
            // return the directive link function. (compile function not needed)
            return function (scope, element, attrs) {
                var format = 'mm:ss a',  // date format
                    stopTime,
                    solicitacao,
                    contador; // so that we can cancel the time updates

                function updateTime() {

                    var novaData = new Date();
                    novaData = moment(novaData).format('DD/MM/YYYY HH:mm:ss');
                    var dataSolicitacao = moment.utc(solicitacao.dataCadastro, "YYYY-MM-DD HH:mm:ss").local();

                    var diferencaData = moment.utc(moment(novaData, "DD/MM/YYYY  HH:mm:ss").diff(moment(dataSolicitacao, "DD/MM/YYYY  HH:mm:ss"))).format("HH:mm:ss");
                    var tempoEmSegundos = moment.duration(diferencaData).asSeconds();

                    if (tempoEmSegundos <= 600) {
                        var intervaloData = moment.utc(moment(dataSolicitacao, "DD/MM/YYYY  HH:mm:ss").diff(moment(novaData, "DD/MM/YYYY HH:mm:ss"))).local().format("HH:mm:ss");
                        contador = moment.utc(moment(intervaloData, "HH:mm:ss").diff(moment("23:50:00", "HH:mm:ss"))).format("mm:ss");
                        /*
                         var progressBar = element.parent().find('div')[0];

                         if (progressBar != undefined) {
                         progressBar.style.width = (100 - ((tempoEmSegundos * 100) / 600)) + "%";
                         }*/

                    } else if (solicitacao.ativo) {

                        SolicitacoesService.get({
                            solicitacaoId: solicitacao._id
                        }).$promise.then(function(response){
                            $interval.cancel(stopTime);
                            solicitacao = response;
                            solicitacao.ativo = false;
                            solicitacao.$update();

                            var solicitacao = {
                                _id: solicitacao._id,
                                user: user
                            };

                            notificacoesApiService.notificarCliente(solicitacao).success(function(response){
                            });
                        });

                        /*services.solicitacaoServices.editar(solicitacao).success(function (response) {
                         $interval.cancel(stopTime);
                         }).then(function () {
                         var device = {};
                         device = {
                         usuarioId: solicitacao.usuarioId,
                         titulo: 'Cotar Bem',
                         mensagem: 'Cotação encerrada'
                         }

                         services.deviceTokenServices.notificar(device).success(function (response) {
                         });

                         solicitacao.url = "app/cotacao/solicitacao/produto/notificacao/solicitacaoId?id=";

                         socket.emit('cotacao-encerrada', solicitacao);
                         });*/

                    } else {
                        $interval.cancel(stopTime);
                    }

                    element.text(dateFilter(contador, format));
                }

                // watch the expression, and update the UI on change.
                scope.$watch(attrs.myCurrentTime, function (value) {
                    ///format = value;
                    solicitacao = value;
                    updateTime();
                });

                stopTime = $interval(updateTime, 1000);

                // listen on DOM destroy (removal) event, and cancel the next UI update
                // to prevent updating time after the DOM element was removed.
                element.on('$destroy', function () {
                    $interval.cancel(stopTime);
                });
            }
        }]);
})();

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

//Cotacoes service used to communicate Cotacoes REST endpoints
(function () {
  'use strict';

  angular
      .module('cotacoes')
      .factory('CotacoesService', CotacoesService);

  CotacoesService.$inject = ['$resource'];

  function CotacoesService($resource) {
    return $resource('api/cotacoes/:cotacaoId', {
      cotacaoId: '@_id'
    }, {
      update: {
        method: 'PUT',
      }
    });
  }

  angular.module('cotacoes').factory('cotacoesApiService', ['$http', cotacoesApiService]);

  function cotacoesApiService($http) {

    function obterPorSolicitacaoId(id) {
      return $http.get('/api/cotacoes/obterPorSolicitacaoId/' + id);
    }

    var services = {
      obterPorSolicitacaoId: obterPorSolicitacaoId
    };

    return services;
  }
    /*angular
        .module('cotacoes')
        .factory('CotacoesPorSolicitacaoService', CotacoesPorSolicitacaoService);

    CotacoesPorSolicitacaoService.$inject = ['$resource'];

    function CotacoesPorSolicitacaoService($resource) {
        return $resource('api/cotacoes/solicitacao/:solicitacaoId', {
            solicitacaoId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }*/
})();

//Cotacoes service used to communicate Cotacoes REST endpoints
(function () {
  'use strict';

  angular.module('notificacoes').factory('notificacoesApiService', ['$http', notificacoesApiService]);

  function notificacoesApiService($http) {

    function notificarFornecedores(solicitacao) {
      return $http.post('/api/notificacao/fornecedores', solicitacao);
    }

    function notificarCliente(solicitacao) {
      return $http.post('/api/notificacao/cliente', solicitacao);
    }

    function notificarFornecedoresProdutos(solicitacao) {
      return $http.post('/api/notificacao/fornecedores/produtos', solicitacao);
    }

    var services = {
      notificarFornecedores: notificarFornecedores,
      notificarCliente: notificarCliente,
      notificarFornecedoresProdutos: notificarFornecedoresProdutos
    };

    return services;
  }
})();

//Solicitacoes service used to communicate Solicitacoes REST endpoints
(function () {
    'use strict';

    angular
        .module('solicitacoes')
        .factory('SolicitacoesService', SolicitacoesService);

    SolicitacoesService.$inject = ['$resource'];

    function SolicitacoesService($resource) {
        return $resource('api/solicitacoes/:solicitacaoId', {
            solicitacaoId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }

    angular.module('solicitacoes').factory('SolicitacoesSegmentoService', ['$resource',
        function ($resource) {
            return $resource('api/solicitacoesPorSubSegmentos', {}, {
            });
        }
    ]);

   /* angular.module('solicitacoes').factory('CotacoesPorSolicitacaoService', ['$resource',
        function ($resource) {
            return $resource('api/cotacoes/solicitacao/:solicitacaoId', {
                solicitacaoId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ]);*/
})();

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

(function () {
  'use strict';

  angular
    .module('segmentos')
    .controller('SegmentosListController', SegmentosListController);

  SegmentosListController.$inject = ['SegmentosService'];

  function SegmentosListController(SegmentosService) {
    var vm = this;

    vm.segmentos = SegmentosService.query();
  }
})();

(function () {
  'use strict';

  // Segmentos controller
  angular
    .module('segmentos')
    .controller('SegmentosController', SegmentosController);

  SegmentosController.$inject = ['$scope', '$state', 'Authentication', 'segmentoResolve'];

  function SegmentosController ($scope, $state, Authentication, segmento) {
    var vm = this;

    vm.authentication = Authentication;
    vm.segmento = segmento;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.segmento.ativo = true;

    // Remove existing Segmento
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.segmento.$remove($state.go('segmentos.list'));
      }
    }

    // Save Segmento
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.segmentoForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.segmento._id) {
        vm.segmento.$update(successCallback, errorCallback);
      } else {
        vm.segmento.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('segmentos.view', {
          segmentoId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

//Segmentos service used to communicate Segmentos REST endpoints
(function () {
  'use strict';

  angular
    .module('segmentos')
    .factory('SegmentosService', SegmentosService);

  SegmentosService.$inject = ['$resource'];

  function SegmentosService($resource) {
    return $resource('api/segmentos/:segmentoId', {
      segmentoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

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

(function () {
  'use strict';

  angular
    .module('subsegmentos')
    .controller('SubsegmentosListController', SubsegmentosListController);

  SubsegmentosListController.$inject = ['SubsegmentosService'];

  function SubsegmentosListController(SubsegmentosService) {
    var vm = this;

    vm.subsegmentos = SubsegmentosService.query();
  }
})();

(function () {
  'use strict';

  // Subsegmentos controller
  angular
    .module('subsegmentos')
    .controller('SubsegmentosController', SubsegmentosController);

  SubsegmentosController.$inject = ['$scope', '$state', 'Authentication', 'subsegmentoResolve', 'SegmentosService'];

  function SubsegmentosController ($scope, $state, Authentication, subsegmento, SegmentosService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.segmentos = SegmentosService.query();
    vm.subsegmento = subsegmento;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.subsegmento.ativo = true;

    // Remove existing Subsegmento
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.subsegmento.$remove($state.go('subsegmentos.list'));
      }
    }

    // Save Subsegmento
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.subsegmentoForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.subsegmento._id) {
        vm.subsegmento.$update(successCallback, errorCallback);
      } else {
        vm.subsegmento.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('subsegmentos.view', {
          subsegmentoId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();

//Subsegmentos service used to communicate Subsegmentos REST endpoints
(function () {
  'use strict';

  angular
    .module('subsegmentos')
    .factory('SubsegmentosService', SubsegmentosService);

  SubsegmentosService.$inject = ['$resource'];

  function SubsegmentosService($resource) {
    return $resource('api/subsegmentos/:subsegmentoId', {
      subsegmentoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['admin', 'cliente', 'fornecedor']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication',
  'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    $scope.tipoUsuario = [{
      _id: 1,
      nome: 'Cliente'
    }, {
      _id: 2,
      nome: 'Fornecedor'
    }];

    $scope.credentials = {};
    $scope.credentials.tipoUsuario = [];
    $scope.credentials.roles = [];
    $scope.settings = {
      externalIdProp: ''
    };

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $scope.credentials.tipoUsuario.forEach(function(tipo){
        $scope.credentials.roles.push(tipo.nome.toLowerCase());
      });

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
