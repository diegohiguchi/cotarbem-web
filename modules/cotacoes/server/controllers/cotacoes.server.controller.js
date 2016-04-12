'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Cotacoes = mongoose.model('Cotacoes'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

/**
 * Create a Cotacoes
 */
exports.create = function(req, res) {
    var cotacao = new Cotacoes(req.body);
    cotacao.user = req.user;

    cotacao.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(cotacao);
        }
    });
};

/**
 * Show the current Cotacoes
 */
exports.read = function(req, res) {
    // convert mongoose document to JSON
    var cotacao = req.cotacao ? req.cotacao.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    cotacao.isCurrentUserOwner = req.user && cotacao.user && cotacao.user._id.toString() === req.user._id.toString() ? true : false;

    res.jsonp(cotacao);
};

/**
 * Update a Cotacoes
 */
exports.update = function(req, res) {
    var cotacao = req.cotacao ;

    cotacao = _.extend(cotacao , req.body);

    cotacao.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(cotacao);
        }
    });
};

/**
 * Delete an Cotacoes
 */
exports.delete = function(req, res) {
    var cotacao = req.cotacao ;

    cotacao.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(cotacao);
        }
    });
};

/**
 * List of Cotacoes
 */
exports.list = function(req, res) {
    Cotacoes.find().sort('-dataCadastro').populate('user', 'displayName').populate('subSegmento', 'nome').populate({path:'solicitacao', select:'dataCadastro ativo'}).exec(function(err, cotacoes) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(cotacoes);
        }
    });
};

/**
 * Cotacoes middleware
 */
exports.cotacaoByID = function(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Cotacoes is invalid'
        });
    }

    Cotacoes.findById(id).populate('user', 'displayName').populate('subSegmento', 'nome').exec(function (err, cotacao) {
        if (err) {
            return next(err);
        }
        else if (!cotacao) {
            return res.status(404).send({
                message: 'No Cotacoes with that identifier has been found'
            });
        }
        req.cotacao = cotacao;
        next();
    });
};

exports.cotacaoSolicitacaoByID = function(req, res, next) {

    Cotacoes.find({ solicitacao: req.params.id }).populate({path:'user', select:'displayName email'}).populate('subSegmento', 'nome').populate({path:'solicitacao', select:'dataCadastro ativo'}).exec(function (err, cotacoes) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(cotacoes);
        }
    });
};

exports.exrpotarParaExcel = function(req, res, next){
    // write to a file
};

