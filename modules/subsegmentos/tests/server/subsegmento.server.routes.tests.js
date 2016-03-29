'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Subsegmento = mongoose.model('Subsegmento'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, subsegmento;

/**
 * Subsegmento routes tests
 */
describe('Subsegmento CRUD tests', function () {

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

    // Save a user to the test db and create new Subsegmento
    user.save(function () {
      subsegmento = {
        name: 'Subsegmento name'
      };

      done();
    });
  });

  it('should be able to save a Subsegmento if logged in', function (done) {
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

        // Save a new Subsegmento
        agent.post('/api/subsegmentos')
          .send(subsegmento)
          .expect(200)
          .end(function (subsegmentoSaveErr, subsegmentoSaveRes) {
            // Handle Subsegmento save error
            if (subsegmentoSaveErr) {
              return done(subsegmentoSaveErr);
            }

            // Get a list of Subsegmentos
            agent.get('/api/subsegmentos')
              .end(function (subsegmentosGetErr, subsegmentosGetRes) {
                // Handle Subsegmento save error
                if (subsegmentosGetErr) {
                  return done(subsegmentosGetErr);
                }

                // Get Subsegmentos list
                var subsegmentos = subsegmentosGetRes.body;

                // Set assertions
                (subsegmentos[0].user._id).should.equal(userId);
                (subsegmentos[0].name).should.match('Subsegmento name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Subsegmento if not logged in', function (done) {
    agent.post('/api/subsegmentos')
      .send(subsegmento)
      .expect(403)
      .end(function (subsegmentoSaveErr, subsegmentoSaveRes) {
        // Call the assertion callback
        done(subsegmentoSaveErr);
      });
  });

  it('should not be able to save an Subsegmento if no name is provided', function (done) {
    // Invalidate name field
    subsegmento.name = '';

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

        // Save a new Subsegmento
        agent.post('/api/subsegmentos')
          .send(subsegmento)
          .expect(400)
          .end(function (subsegmentoSaveErr, subsegmentoSaveRes) {
            // Set message assertion
            (subsegmentoSaveRes.body.message).should.match('Please fill Subsegmento name');

            // Handle Subsegmento save error
            done(subsegmentoSaveErr);
          });
      });
  });

  it('should be able to update an Subsegmento if signed in', function (done) {
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

        // Save a new Subsegmento
        agent.post('/api/subsegmentos')
          .send(subsegmento)
          .expect(200)
          .end(function (subsegmentoSaveErr, subsegmentoSaveRes) {
            // Handle Subsegmento save error
            if (subsegmentoSaveErr) {
              return done(subsegmentoSaveErr);
            }

            // Update Subsegmento name
            subsegmento.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Subsegmento
            agent.put('/api/subsegmentos/' + subsegmentoSaveRes.body._id)
              .send(subsegmento)
              .expect(200)
              .end(function (subsegmentoUpdateErr, subsegmentoUpdateRes) {
                // Handle Subsegmento update error
                if (subsegmentoUpdateErr) {
                  return done(subsegmentoUpdateErr);
                }

                // Set assertions
                (subsegmentoUpdateRes.body._id).should.equal(subsegmentoSaveRes.body._id);
                (subsegmentoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Subsegmentos if not signed in', function (done) {
    // Create new Subsegmento model instance
    var subsegmentoObj = new Subsegmento(subsegmento);

    // Save the subsegmento
    subsegmentoObj.save(function () {
      // Request Subsegmentos
      request(app).get('/api/subsegmentos')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Subsegmento if not signed in', function (done) {
    // Create new Subsegmento model instance
    var subsegmentoObj = new Subsegmento(subsegmento);

    // Save the Subsegmento
    subsegmentoObj.save(function () {
      request(app).get('/api/subsegmentos/' + subsegmentoObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', subsegmento.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Subsegmento with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/subsegmentos/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Subsegmento is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Subsegmento which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Subsegmento
    request(app).get('/api/subsegmentos/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Subsegmento with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Subsegmento if signed in', function (done) {
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

        // Save a new Subsegmento
        agent.post('/api/subsegmentos')
          .send(subsegmento)
          .expect(200)
          .end(function (subsegmentoSaveErr, subsegmentoSaveRes) {
            // Handle Subsegmento save error
            if (subsegmentoSaveErr) {
              return done(subsegmentoSaveErr);
            }

            // Delete an existing Subsegmento
            agent.delete('/api/subsegmentos/' + subsegmentoSaveRes.body._id)
              .send(subsegmento)
              .expect(200)
              .end(function (subsegmentoDeleteErr, subsegmentoDeleteRes) {
                // Handle subsegmento error error
                if (subsegmentoDeleteErr) {
                  return done(subsegmentoDeleteErr);
                }

                // Set assertions
                (subsegmentoDeleteRes.body._id).should.equal(subsegmentoSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Subsegmento if not signed in', function (done) {
    // Set Subsegmento user
    subsegmento.user = user;

    // Create new Subsegmento model instance
    var subsegmentoObj = new Subsegmento(subsegmento);

    // Save the Subsegmento
    subsegmentoObj.save(function () {
      // Try deleting Subsegmento
      request(app).delete('/api/subsegmentos/' + subsegmentoObj._id)
        .expect(403)
        .end(function (subsegmentoDeleteErr, subsegmentoDeleteRes) {
          // Set message assertion
          (subsegmentoDeleteRes.body.message).should.match('User is not authorized');

          // Handle Subsegmento error error
          done(subsegmentoDeleteErr);
        });

    });
  });

  it('should be able to get a single Subsegmento that has an orphaned user reference', function (done) {
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

          // Save a new Subsegmento
          agent.post('/api/subsegmentos')
            .send(subsegmento)
            .expect(200)
            .end(function (subsegmentoSaveErr, subsegmentoSaveRes) {
              // Handle Subsegmento save error
              if (subsegmentoSaveErr) {
                return done(subsegmentoSaveErr);
              }

              // Set assertions on new Subsegmento
              (subsegmentoSaveRes.body.name).should.equal(subsegmento.name);
              should.exist(subsegmentoSaveRes.body.user);
              should.equal(subsegmentoSaveRes.body.user._id, orphanId);

              // force the Subsegmento to have an orphaned user reference
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

                    // Get the Subsegmento
                    agent.get('/api/subsegmentos/' + subsegmentoSaveRes.body._id)
                      .expect(200)
                      .end(function (subsegmentoInfoErr, subsegmentoInfoRes) {
                        // Handle Subsegmento error
                        if (subsegmentoInfoErr) {
                          return done(subsegmentoInfoErr);
                        }

                        // Set assertions
                        (subsegmentoInfoRes.body._id).should.equal(subsegmentoSaveRes.body._id);
                        (subsegmentoInfoRes.body.name).should.equal(subsegmento.name);
                        should.equal(subsegmentoInfoRes.body.user, undefined);

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
      Subsegmento.remove().exec(done);
    });
  });
});
