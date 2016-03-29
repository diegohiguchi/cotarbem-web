(function () {
  'use strict';

  describe('Segmentos Controller Tests', function () {
    // Initialize global variables
    var SegmentosController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      SegmentosService,
      mockSegmento;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _SegmentosService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      SegmentosService = _SegmentosService_;

      // create mock Segmento
      mockSegmento = new SegmentosService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Segmento Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Segmentos controller.
      SegmentosController = $controller('SegmentosController as vm', {
        $scope: $scope,
        segmentoResolve: {}
      });

      //Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleSegmentoPostData;

      beforeEach(function () {
        // Create a sample Segmento object
        sampleSegmentoPostData = new SegmentosService({
          name: 'Segmento Name'
        });

        $scope.vm.segmento = sampleSegmentoPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (SegmentosService) {
        // Set POST response
        $httpBackend.expectPOST('api/segmentos', sampleSegmentoPostData).respond(mockSegmento);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Segmento was created
        expect($state.go).toHaveBeenCalledWith('segmentos.view', {
          segmentoId: mockSegmento._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/segmentos', sampleSegmentoPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Segmento in $scope
        $scope.vm.segmento = mockSegmento;
      });

      it('should update a valid Segmento', inject(function (SegmentosService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/segmentos\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('segmentos.view', {
          segmentoId: mockSegmento._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (SegmentosService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/segmentos\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        //Setup Segmentos
        $scope.vm.segmento = mockSegmento;
      });

      it('should delete the Segmento and redirect to Segmentos', function () {
        //Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/segmentos\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('segmentos.list');
      });

      it('should should not delete the Segmento and not redirect', function () {
        //Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
