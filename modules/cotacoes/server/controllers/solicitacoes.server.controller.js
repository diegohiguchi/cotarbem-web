'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Solicitacoes = mongoose.model('Solicitacoes'),
    Cotacoes = mongoose.model('Cotacoes'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    multer = require('multer'),
    config = require(path.resolve('./config/config')),
    _ = require('lodash');

/**
 * Create a Solicitacoes
 */
exports.create = function(req, res) {
    var solicitacoes = new Solicitacoes(req.body);
    solicitacoes.user = req.user;

    solicitacoes.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(solicitacoes);
        }
    });
};

exports.uploadImages = function(req, res) {
    var upload = multer(config.uploads.produtoUpload).array('novaImagemProduto');
    var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

    // Filtering to upload only images
    upload.fileFilter = profileUploadFileFilter;

    upload(req, res, function (uploadError) {
        if (uploadError) {
            return res.status(400).send({
                message: 'Error occurred while uploading profile picture'
            });
        } else {
            var id = req.body._id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).send({
                    message: 'Solicitacoes is invalid'
                });
            }

            Solicitacoes.findById(id).populate('user', 'displayName').exec(function (err, solicitacoes) {
                if (err) {
                    return next(err);
                } else if (!solicitacoes) {
                    return res.status(404).send({
                        message: 'No Solicitacoes with that identifier has been found'
                    });
                }

                for(var i = 0; i < solicitacoes.produtos.length; i++) {
                    if(req.files[i] !== undefined)
                        solicitacoes.produtos[i].imagemURL = config.uploads.produtoUpload.dest + req.files[i].filename;
                }

                solicitacoes.save(function(err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(solicitacoes);
                    }
                });

            });
        }
    });
};

/**
 * Show the current Solicitacoes
 */
exports.read = function(req, res) {
    // convert mongoose document to JSON
    var solicitacoes = req.solicitacoes ? req.solicitacoes.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    solicitacoes.isCurrentUserOwner = req.user && solicitacoes.user && solicitacoes.user._id.toString() === req.user._id.toString() ? true : false;

    res.jsonp(solicitacoes);
};

/**
 * Update a Solicitacoes
 */
exports.update = function(req, res) {
    var solicitacoes = req.solicitacoes ;

    solicitacoes = _.extend(solicitacoes , req.body);

    solicitacoes.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(solicitacoes);
        }
    });
};

/**
 * Delete an Solicitacoes
 */
exports.delete = function(req, res) {
    var solicitacoes = req.solicitacoes ;

    solicitacoes.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(solicitacoes);
        }
    });
};

/**
 * List of Solicitacoes
 */
exports.list = function(req, res) {
    Solicitacoes.find({ user: req.user._id }).sort('-dataCadastro').populate('user', 'displayName').populate('subSegmento', 'nome').exec(function(err, solicitacoes) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(solicitacoes);
        }
    });
};

/**
 * List of Solicitacoes por SubSegmento
 */
exports.listaPorSubSegmentos = function(req, res) {
    Solicitacoes.find({ subSegmento: { $in: req.user.subSegmentos } }).sort('-dataCadastro').populate('user', 'displayName').populate('subSegmento', 'nome').exec(function(err, solicitacoes) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(solicitacoes);
        }
    });
};
/**
 * Solicitacoes middleware
 */
exports.solicitacaoByID = function(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Solicitacoes is invalid'
        });
    }

    Solicitacoes.findById(id).populate('user', 'displayName').populate('subSegmento', 'nome').exec(function (err, solicitacoes) {
        if (err) {
            return next(err);
        } else if (!solicitacoes) {
            return res.status(404).send({
                message: 'No Solicitacoes with that identifier has been found'
            });
        }
        req.solicitacoes = solicitacoes;
        next();
    });
};
