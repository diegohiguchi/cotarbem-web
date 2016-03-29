'use strict';

describe('Subsegmentos E2E Tests:', function () {
  describe('Test Subsegmentos page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/subsegmentos');
      expect(element.all(by.repeater('subsegmento in subsegmentos')).count()).toEqual(0);
    });
  });
});
