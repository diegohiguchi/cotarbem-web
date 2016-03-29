'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Segmento = mongoose.model('Segmento'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, segmento;

/**
 * Segmento routes tests
 */
describe('Segmento CRUD tests', function () {

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

    // Save a user to the test db and create new Segmento
    user.save(function () {
      segmento = {
        name: 'Segmento name'
      };

      done();
    });
  });

  it('should be able to save a Segmento if logged in', function (done) {
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

        // Save a new Segmento
        agent.post('/api/segmentos')
          .send(segmento)
          .expect(200)
          .end(function (segmentoSaveErr, segmentoSaveRes) {
            // Handle Segmento save error
            if (segmentoSaveErr) {
              return done(segmentoSaveErr);
            }

            // Get a list of Segmentos
            agent.get('/api/segmentos')
              .end(function (segmentosGetErr, segmentosGetRes) {
                // Handle Segmento save error
                if (segmentosGetErr) {
                  return done(segmentosGetErr);
                }

                // Get Segmentos list
                var segmentos = segmentosGetRes.body;

                // Set assertions
                (segmentos[0].user._id).should.equal(userId);
                (segmentos[0].name).should.match('Segmento name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Segmento if not logged in', function (done) {
    agent.post('/api/segmentos')
      .send(segmento)
      .expect(403)
      .end(function (segmentoSaveErr, segmentoSaveRes) {
        // Call the assertion callback
        done(segmentoSaveErr);
      });
  });

  it('should not be able to save an Segmento if no name is provided', function (done) {
    // Invalidate name field
    segmento.name = '';

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

        // Save a new Segmento
        agent.post('/api/segmentos')
          .send(segmento)
          .expect(400)
          .end(function (segmentoSaveErr, segmentoSaveRes) {
            // Set message assertion
            (segmentoSaveRes.body.message).should.match('Please fill Segmento name');

            // Handle Segmento save error
            done(segmentoSaveErr);
          });
      });
  });

  it('should be able to update an Segmento if signed in', function (done) {
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

        // Save a new Segmento
        agent.post('/api/segmentos')
          .send(segmento)
          .expect(200)
          .end(function (segmentoSaveErr, segmentoSaveRes) {
            // Handle Segmento save error
            if (segmentoSaveErr) {
              return done(segmentoSaveErr);
            }

            // Update Segmento name
            segmento.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Segmento
            agent.put('/api/segmentos/' + segmentoSaveRes.body._id)
              .send(segmento)
              .expect(200)
              .end(function (segmentoUpdateErr, segmentoUpdateRes) {
                // Handle Segmento update error
                if (segmentoUpdateErr) {
                  return done(segmentoUpdateErr);
                }

                // Set assertions
                (segmentoUpdateRes.body._id).should.equal(segmentoSaveRes.body._id);
                (segmentoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Segmentos if not signed in', function (done) {
    // Create new Segmento model instance
    var segmentoObj = new Segmento(segmento);

    // Save the segmento
    segmentoObj.save(function () {
      // Request Segmentos
      request(app).get('/api/segmentos')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Segmento if not signed in', function (done) {
    // Create new Segmento model instance
    var segmentoObj = new Segmento(segmento);

    // Save the Segmento
    segmentoObj.save(function () {
      request(app).get('/api/segmentos/' + segmentoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', segmento.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Segmento with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/segmentos/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Segmento is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Segmento which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Segmento
    request(app).get('/api/segmentos/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Segmento with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Segmento if signed in', function (done) {
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

        // Save a new Segmento
        agent.post('/api/segmentos')
          .send(segmento)
          .expect(200)
          .end(function (segmentoSaveErr, segmentoSaveRes) {
            // Handle Segmento save error
            if (segmentoSaveErr) {
              return done(segmentoSaveErr);
            }

            // Delete an existing Segmento
            agent.delete('/api/segmentos/' + segmentoSaveRes.body._id)
              .send(segmento)
              .expect(200)
              .end(function (segmentoDeleteErr, segmentoDeleteRes) {
                // Handle segmento error error
                if (segmentoDeleteErr) {
                  return done(segmentoDeleteErr);
                }

                // Set assertions
                (segmentoDeleteRes.body._id).should.equal(segmentoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Segmento if not signed in', function (done) {
    // Set Segmento user
    segmento.user = user;

    // Create new Segmento model instance
    var segmentoObj = new Segmento(segmento);

    // Save the Segmento
    segmentoObj.save(function () {
      // Try deleting Segmento
      request(app).delete('/api/segmentos/' + segmentoObj._id)
        .expect(403)
        .end(function (segmentoDeleteErr, segmentoDeleteRes) {
          // Set message assertion
          (segmentoDeleteRes.body.message).should.match('User is not authorized');

          // Handle Segmento error error
          done(segmentoDeleteErr);
        });

    });
  });

  it('should be able to get a single Segmento that has an orphaned user reference', function (done) {
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

          // Save a new Segmento
          agent.post('/api/segmentos')
            .send(segmento)
            .expect(200)
            .end(function (segmentoSaveErr, segmentoSaveRes) {
              // Handle Segmento save error
              if (segmentoSaveErr) {
                return done(segmentoSaveErr);
              }

              // Set assertions on new Segmento
              (segmentoSaveRes.body.name).should.equal(segmento.name);
              should.exist(segmentoSaveRes.body.user);
              should.equal(segmentoSaveRes.body.user._id, orphanId);

              // force the Segmento to have an orphaned user reference
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

                    // Get the Segmento
                    agent.get('/api/segmentos/' + segmentoSaveRes.body._id)
                      .expect(200)
                      .end(function (segmentoInfoErr, segmentoInfoRes) {
                        // Handle Segmento error
                        if (segmentoInfoErr) {
                          return done(segmentoInfoErr);
                        }

                        // Set assertions
                        (segmentoInfoRes.body._id).should.equal(segmentoSaveRes.body._id);
                        (segmentoInfoRes.body.name).should.equal(segmento.name);
                        should.equal(segmentoInfoRes.body.user, undefined);

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
      Segmento.remove().exec(done);
    });
  });
});
