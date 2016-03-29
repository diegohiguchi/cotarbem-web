(function () {
  'use strict';

  describe('Segmentos List Controller Tests', function () {
    // Initialize global variables
    var SegmentosListController,
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

      // create mock article
      mockSegmento = new SegmentosService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Segmento Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Segmentos List controller.
      SegmentosListController = $controller('SegmentosListController as vm', {
        $scope: $scope
      });

      //Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockSegmentoList;

      beforeEach(function () {
        mockSegmentoList = [mockSegmento, mockSegmento];
      });

      it('should send a GET request and return all Segmentos', inject(function (SegmentosService) {
        // Set POST response
        $httpBackend.expectGET('api/segmentos').respond(mockSegmentoList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.segmentos.length).toEqual(2);
        expect($scope.vm.segmentos[0]).toEqual(mockSegmento);
        expect($scope.vm.segmentos[1]).toEqual(mockSegmento);

      }));
    });
  });
})();
