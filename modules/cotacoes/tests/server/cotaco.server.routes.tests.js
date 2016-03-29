'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Cotacoes = mongoose.model('Cotacoes'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, cotacoes;

/**
 * Cotacoes routes tests
 */
describe('Cotacoes CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Cotacoes
    user.save(function () {
      cotacoes = {
        name: 'Cotacoes name'
      };

      done();
    });
  });

  it('should be able to save a Cotacoes if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cotacoes
        agent.post('/api/cotacoes')
          .send(cotacoes)
          .expect(200)
          .end(function (cotacoesSaveErr, cotacoesSaveRes) {
            // Handle Cotacoes save error
            if (cotacoesSaveErr) {
              return done(cotacoesSaveErr);
            }

            // Get a list of Cotacoes
            agent.get('/api/cotacoes')
              .end(function (cotacoesGetErr, cotacoesGetRes) {
                // Handle Cotacoes save error
                if (cotacoesGetErr) {
                  return done(cotacoesGetErr);
                }

                // Get Cotacoes list
                var cotacoes = cotacoesGetRes.body;

                // Set assertions
                (cotacoes[0].user._id).should.equal(userId);
                (cotacoes[0].name).should.match('Cotacoes name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Cotacoes if not logged in', function (done) {
    agent.post('/api/cotacoes')
      .send(cotacoes)
      .expect(403)
      .end(function (cotacoesSaveErr, cotacoesSaveRes) {
        // Call the assertion callback
        done(cotacoesSaveErr);
      });
  });

  it('should not be able to save an Cotacoes if no name is provided', function (done) {
    // Invalidate name field
    cotacoes.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cotacoes
        agent.post('/api/cotacoes')
          .send(cotacoes)
          .expect(400)
          .end(function (cotacoesSaveErr, cotacoesSaveRes) {
            // Set message assertion
            (cotacoesSaveRes.body.message).should.match('Please fill Cotacoes name');

            // Handle Cotacoes save error
            done(cotacoesSaveErr);
          });
      });
  });

  it('should be able to update an Cotacoes if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cotacoes
        agent.post('/api/cotacoes')
          .send(cotacoes)
          .expect(200)
          .end(function (cotacoesSaveErr, cotacoesSaveRes) {
            // Handle Cotacoes save error
            if (cotacoesSaveErr) {
              return done(cotacoesSaveErr);
            }

            // Update Cotacoes name
            cotacoes.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Cotacoes
            agent.put('/api/cotacoes/' + cotacoesSaveRes.body._id)
              .send(cotacoes)
              .expect(200)
              .end(function (cotacoUpdateErr, cotacoUpdateRes) {
                // Handle Cotacoes update error
                if (cotacoUpdateErr) {
                  return done(cotacoUpdateErr);
                }

                // Set assertions
                (cotacoUpdateRes.body._id).should.equal(cotacoesSaveRes.body._id);
                (cotacoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Cotacoes if not signed in', function (done) {
    // Create new Cotacoes model instance
    var cotacoObj = new Cotacoes(cotacoes);

    // Save the cotacoes
    cotacoObj.save(function () {
      // Request Cotacoes
      request(app).get('/api/cotacoes')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Cotacoes if not signed in', function (done) {
    // Create new Cotacoes model instance
    var cotacoObj = new Cotacoes(cotacoes);

    // Save the Cotacoes
    cotacoObj.save(function () {
      request(app).get('/api/cotacoes/' + cotacoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', cotacoes.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Cotacoes with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/cotacoes/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Cotacoes is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Cotacoes which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Cotacoes
    request(app).get('/api/cotacoes/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Cotacoes with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Cotacoes if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Cotacoes
        agent.post('/api/cotacoes')
          .send(cotacoes)
          .expect(200)
          .end(function (cotacoesSaveErr, cotacoesSaveRes) {
            // Handle Cotacoes save error
            if (cotacoesSaveErr) {
              return done(cotacoesSaveErr);
            }

            // Delete an existing Cotacoes
            agent.delete('/api/cotacoes/' + cotacoesSaveRes.body._id)
              .send(cotacoes)
              .expect(200)
              .end(function (cotacoDeleteErr, cotacoDeleteRes) {
                // Handle cotacoes error error
                if (cotacoDeleteErr) {
                  return done(cotacoDeleteErr);
                }

                // Set assertions
                (cotacoDeleteRes.body._id).should.equal(cotacoesSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Cotacoes if not signed in', function (done) {
    // Set Cotacoes user
    cotacoes.user = user;

    // Create new Cotacoes model instance
    var cotacoObj = new Cotacoes(cotacoes);

    // Save the Cotacoes
    cotacoObj.save(function () {
      // Try deleting Cotacoes
      request(app).delete('/api/cotacoes/' + cotacoObj._id)
        .expect(403)
        .end(function (cotacoDeleteErr, cotacoDeleteRes) {
          // Set message assertion
          (cotacoDeleteRes.body.message).should.match('User is not authorized');

          // Handle Cotacoes error error
          done(cotacoDeleteErr);
        });

    });
  });

  it('should be able to get a single Cotacoes that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Cotacoes
          agent.post('/api/cotacoes')
            .send(cotacoes)
            .expect(200)
            .end(function (cotacoesSaveErr, cotacoesSaveRes) {
              // Handle Cotacoes save error
              if (cotacoesSaveErr) {
                return done(cotacoesSaveErr);
              }

              // Set assertions on new Cotacoes
              (cotacoesSaveRes.body.name).should.equal(cotacoes.name);
              should.exist(cotacoesSaveRes.body.user);
              should.equal(cotacoesSaveRes.body.user._id, orphanId);

              // force the Cotacoes to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Cotacoes
                    agent.get('/api/cotacoes/' + cotacoesSaveRes.body._id)
                      .expect(200)
                      .end(function (cotacoInfoErr, cotacoInfoRes) {
                        // Handle Cotacoes error
                        if (cotacoInfoErr) {
                          return done(cotacoInfoErr);
                        }

                        // Set assertions
                        (cotacoInfoRes.body._id).should.equal(cotacoesSaveRes.body._id);
                        (cotacoInfoRes.body.name).should.equal(cotacoes.name);
                        should.equal(cotacoInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Cotacoes.remove().exec(done);
    });
  });
});
