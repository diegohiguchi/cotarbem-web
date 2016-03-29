'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Subsegmento = mongoose.model('Subsegmento'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Subsegmento
 */
exports.create = function(req, res) {
  var subsegmento = new Subsegmento(req.body);
  subsegmento.user = req.user;

  subsegmento.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(subsegmento);
    }
  });
};

/**
 * Show the current Subsegmento
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var subsegmento = req.subsegmento ? req.subsegmento.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  subsegmento.isCurrentUserOwner = req.user && subsegmento.user && subsegmento.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(subsegmento);
};

/**
 * Update a Subsegmento
 */
exports.update = function(req, res) {
  var subsegmento = req.subsegmento ;

  subsegmento = _.extend(subsegmento , req.body);

  subsegmento.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(subsegmento);
    }
  });
};

/**
 * Delete an Subsegmento
 */
exports.delete = function(req, res) {
  var subsegmento = req.subsegmento ;

  subsegmento.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(subsegmento);
    }
  });
};

/**
 * List of Subsegmentos
 */
exports.list = function(req, res) { 
  Subsegmento.find().sort('-dataCadastro').populate('user', 'displayName').populate('segmento', 'nome').exec(function(err, subsegmentos) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(subsegmentos);
    }
  });
};

/**
 * Subsegmento middleware
 */
exports.subsegmentoByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Subsegmento is invalid'
    });
  }

  Subsegmento.findById(id).populate('user', 'displayName').populate('segmento', 'nome').exec(function (err, subsegmento) {
    if (err) {
      return next(err);
    } else if (!subsegmento) {
      return res.status(404).send({
        message: 'No Subsegmento with that identifier has been found'
      });
    }
    req.subsegmento = subsegmento;
    next();
  });
};
