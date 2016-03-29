'use strict';

/**
 * Module dependencies
 */
var segmentosPolicy = require('../policies/segmentos.server.policy'),
  segmentos = require('../controllers/segmentos.server.controller');

module.exports = function(app) {
  // Segmentos Routes
  app.route('/api/segmentos').all(segmentosPolicy.isAllowed)
    .get(segmentos.list)
    .post(segmentos.create);

  app.route('/api/segmentos/:segmentoId').all(segmentosPolicy.isAllowed)
    .get(segmentos.read)
    .put(segmentos.update)
    .delete(segmentos.delete);

  // Finish by binding the Segmento middleware
  app.param('segmentoId', segmentos.segmentoByID);
};
