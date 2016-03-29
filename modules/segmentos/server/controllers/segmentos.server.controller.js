'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Segmento = mongoose.model('Segmento'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Segmento
 */
exports.create = function(req, res) {
  var segmento = new Segmento(req.body);
  segmento.user = req.user;

  segmento.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(segmento);
    }
  });
};

/**
 * Show the current Segmento
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var segmento = req.segmento ? req.segmento.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  segmento.isCurrentUserOwner = req.user && segmento.user && segmento.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(segmento);
};

/**
 * Update a Segmento
 */
exports.update = function(req, res) {
  var segmento = req.segmento ;

  segmento = _.extend(segmento , req.body);

  segmento.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(segmento);
    }
  });
};

/**
 * Delete an Segmento
 */
exports.delete = function(req, res) {
  var segmento = req.segmento ;

  segmento.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(segmento);
    }
  });
};

/**
 * List of Segmentos
 */
exports.list = function(req, res) { 
  Segmento.find().sort('-dataCadastro').populate('user', 'displayName').exec(function(err, segmentos) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(segmentos);
    }
  });
};

/**
 * Segmento middleware
 */
exports.segmentoByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Segmento is invalid'
    });
  }

  Segmento.findById(id).populate('user', 'displayName').exec(function (err, segmento) {
    if (err) {
      return next(err);
    } else if (!segmento) {
      return res.status(404).send({
        message: 'No Segmento with that identifier has been found'
      });
    }
    req.segmento = segmento;
    next();
  });
};
