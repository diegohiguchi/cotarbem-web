'use strict';

describe('Cotacoes E2E Tests:', function () {
  describe('Test Cotacoes page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/cotacoes');
      expect(element.all(by.repeater('cotaco in cotacoes')).count()).toEqual(0);
    });
  });
});
