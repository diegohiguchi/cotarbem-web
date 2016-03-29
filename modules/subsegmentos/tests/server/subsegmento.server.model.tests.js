'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Subsegmento = mongoose.model('Subsegmento');

/**
 * Globals
 */
var user, subsegmento;

/**
 * Unit tests
 */
describe('Subsegmento Model Unit Tests:', function() {
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
      subsegmento = new Subsegmento({
        name: 'Subsegmento Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return subsegmento.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) { 
      subsegmento.name = '';

      return subsegmento.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) { 
    Subsegmento.remove().exec(function(){
      User.remove().exec(function(){
        done();  
      });
    });
  });
});
