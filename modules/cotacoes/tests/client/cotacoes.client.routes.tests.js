(function () {
  'use strict';

  describe('Cotacoes Route Tests', function () {
    // Initialize global variables
    var $scope,
      CotacoesService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CotacoesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CotacoesService = _CotacoesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('cotacoes');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/cotacoes');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          CotacoesController,
          mockCotaco;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('cotacoes.view');
          $templateCache.put('modules/cotacoes/client/views/view-cotaco.client.view.html', '');

          // create mock Cotaco
          mockCotaco = new CotacoesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cotaco Name'
          });

          //Initialize Controller
          CotacoesController = $controller('CotacoesController as vm', {
            $scope: $scope,
            cotacoResolve: mockCotaco
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:cotacoId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.cotacoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            cotacoId: 1
          })).toEqual('/cotacoes/1');
        }));

        it('should attach an Cotaco to the controller scope', function () {
          expect($scope.vm.cotaco._id).toBe(mockCotaco._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/cotacoes/client/views/view-cotaco.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CotacoesController,
          mockCotaco;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('cotacoes.create');
          $templateCache.put('modules/cotacoes/client/views/form-cotaco.client.view.html', '');

          // create mock Cotaco
          mockCotaco = new CotacoesService();

          //Initialize Controller
          CotacoesController = $controller('CotacoesController as vm', {
            $scope: $scope,
            cotacoResolve: mockCotaco
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.cotacoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/cotacoes/create');
        }));

        it('should attach an Cotaco to the controller scope', function () {
          expect($scope.vm.cotaco._id).toBe(mockCotaco._id);
          expect($scope.vm.cotaco._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/cotacoes/client/views/form-cotaco.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CotacoesController,
          mockCotaco;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('cotacoes.edit');
          $templateCache.put('modules/cotacoes/client/views/form-cotaco.client.view.html', '');

          // create mock Cotaco
          mockCotaco = new CotacoesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Cotaco Name'
          });

          //Initialize Controller
          CotacoesController = $controller('CotacoesController as vm', {
            $scope: $scope,
            cotacoResolve: mockCotaco
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:cotacoId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.cotacoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            cotacoId: 1
          })).toEqual('/cotacoes/1/edit');
        }));

        it('should attach an Cotaco to the controller scope', function () {
          expect($scope.vm.cotaco._id).toBe(mockCotaco._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/cotacoes/client/views/form-cotaco.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
