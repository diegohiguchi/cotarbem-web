'use strict';

describe('Segmentos E2E Tests:', function () {
  describe('Test Segmentos page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/segmentos');
      expect(element.all(by.repeater('segmento in segmentos')).count()).toEqual(0);
    });
  });
});
