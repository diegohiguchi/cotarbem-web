'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Cotacoes = mongoose.model('Cotacoes');

/**
 * Globals
 */
var user, cotacoes;

/**
 * Unit tests
 */
describe('Cotacoes Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() { 
      cotacoes = new Cotacoes({
        name: 'Cotacoes Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return cotacoes.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) { 
      cotacoes.name = '';

      return cotacoes.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) { 
    Cotacoes.remove().exec(function(){
      User.remove().exec(function(){
        done();  
      });
    });
  });
});
