'use strict';

/**
 * Module dependencies
 */
var subsegmentosPolicy = require('../policies/subsegmentos.server.policy'),
  subsegmentos = require('../controllers/subsegmentos.server.controller');

module.exports = function(app) {
  // Subsegmentos Routes
  app.route('/api/subsegmentos').all(subsegmentosPolicy.isAllowed)
    .get(subsegmentos.list)
    .post(subsegmentos.create);

  app.route('/api/subsegmentos/:subsegmentoId').all(subsegmentosPolicy.isAllowed)
    .get(subsegmentos.read)
    .put(subsegmentos.update)
    .delete(subsegmentos.delete);

  // Finish by binding the Subsegmento middleware
  app.param('subsegmentoId', subsegmentos.subsegmentoByID);
};
