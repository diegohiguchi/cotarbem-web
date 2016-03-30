'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    _ = require('underscore'),
    moment = require('moment'),
    sendgrid = require('sendgrid')('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');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.notificarFornecedores = function (req, res, next) {
    async.waterfall([

        function (done) {
            var solicitacao = req.body;

            if (solicitacao.subSegmento) {
                User.find({
                    subSegmentos: solicitacao.subSegmento
                }, function (err, users) {
                    if (!users) {
                        return res.status(400).send({
                            message: 'No account with that username has been found'
                        });
                    } else {
                        for (var i = 0; i < users.length; i++) {
                            if (users != null) {
                                done(err, users[i], solicitacao);
                            }
                        }
                    }
                });
            } else {
                return res.status(400).send({
                    message: 'Username field must not be blank'
                });
            }
        },
        function (user, solicitacao, done) {
            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
                httpTransport = 'https://';
            }
            res.render(path.resolve('modules/cotacoes/server/templates/solicitacoes'), {
                name: user.displayName,
                appName: config.app.title,
                url: httpTransport + req.headers.host + '/cotacoes/fornecedor/' + solicitacao._id
            }, function (err, emailHTML) {
                done(err, emailHTML, user);
            });
        },
        // If valid email, send reset email using service
        function (emailHTML, user, done) {
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Solicitação para cotação',
                html: emailHTML
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err) {
                    //res.sendfile('modules/cotacoes/client/views/cliente/solicitacoes/form-solicitacao-cliente.client.view.html');

                    /*res.end({
                     message: 'An email has been sent to the provided email with further instructions.'
                     });*/


                } else {
                    return res.status(400).send({
                        message: 'Falhou enviou do email'
                    });
                }

                done(err);
            });
        }
    ], function (err) {
        if (err) {
            return next(err);
        }

        res.sendFile(path.resolve('modules/cotacoes/client/views/cliente/solicitacoes/form-solicitacao-cliente.client.view.html'));
    });
};

exports.notificarCliente = function (req, res, next) {
    async.waterfall([

        function (done) {
            var solicitacao = req.body;
            var user = solicitacao.user;

            var httpTransport = 'http://';
            if (config.secure && config.secure.ssl === true) {
                httpTransport = 'https://';
            }
            res.render(path.resolve('modules/cotacoes/server/templates/cotacoes'), {
                name: user.displayName,
                appName: config.app.title,
                url: httpTransport + req.headers.host + '/cliente/cotacoes/solicitacao/' + solicitacao._id
            }, function (err, emailHTML) {
                done(err, emailHTML, user);
            });
        },

        function (emailHTML, user, done) {
            var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Cotação encerrada',
                html: emailHTML
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (!err) {
                    res.send({
                        message: 'An email has been sent to the provided email with further instructions.'
                    });
                } else {
                    return res.status(400).send({
                        message: 'Falhou enviou do email'
                    });
                }

                done(err);
            });
        }
    ], function (err) {
        if (err) {
            return next(err);
        }
    });
};

exports.notificarFornecedoresProdutos = function (req, res, next) {
    var produtos = req.body;
    var fornecedores = [];
    var cliente = req.user;
    var quantidadeMensagens = 0;
    var fornecedorEmail = '';

    produtos = _.pairs(produtos);
    fornecedores = _.map(produtos, _.first);

    for (var i = 0; i < fornecedores.length; i++) {

        for(var i =0; i < produtos.length;i++) {
            produtos[i] = _.flatten(produtos[i]);
            var produtosSelecionados = _.reject(produtos[i], _.first);

            var emailHtml = '<table border="1px; solid black;" style="border-collapse: collapse;"><thead>' +
                '                <tr>' +
                '                <th>Nome do Produto</th>' +
                '            <th>Tipo da Cotação</th>' +
                '            <th>Quantidade</th>' +
                '            <th>Data de Entrega</th>' +
                '            <th>Valor</th>' +
                '            <th>Valor Total</th>' +
                '            </tr>' +
                '            </thead><tbody>';

            for (var j = 0; j < produtosSelecionados.length; j++) {

                var dataEntrega = produtosSelecionados[j].dataEntrega === undefined ? "-" : moment(new Date(produtosSelecionados[j].dataEntrega)).format("DD/MM/YYYY");

                emailHtml = emailHtml.concat('<tr><td>'+ produtosSelecionados[j].nome +'</td><td>'+ produtosSelecionados[j].tipoCotacao +'</td>' +
                    '<td>'+ produtosSelecionados[j].quantidade +'</td>'+
                    '<td>' + dataEntrega +'</td>' +
                    '<td>'+ produtosSelecionados[j].valor +'</td>' +
                    '<td>'+ parseFloat(produtosSelecionados[j].quantidade * produtosSelecionados[j].valor).toFixed(2) +'</td><tr>');

                if(fornecedorEmail != produtosSelecionados[j].user.email)
                    fornecedorEmail = produtosSelecionados[j].user.email;
            }

            emailHtml = emailHtml.concat('</tr></tbody></table>');

            var email = new sendgrid.Email();
            email.addTo(fornecedorEmail);
            email.subject = "Produtos selecionados";
            email.from = config.mailer.from;
            email.text = 'Olá!';
            email.html = emailHtml;
            email.setSubstitutions({fornecedorNome: [fornecedores[i]], clienteNome: [cliente.displayName], clienteEmail: [cliente.email]});
            email.addFilter('templates', 'template_id', '872ad5ec-0200-426b-b297-bbae224ac0b0');

            sendgrid.send(email, function(err,json){
                if (err) {
                    return console.error(err);
                }

                quantidadeMensagens++;

                if(quantidadeMensagens === fornecedores.length)
                    res.sendFile(path.resolve('modules/cotacoes/client/views/cliente/solicitacoes/form-solicitacao-cliente.client.view.html'));

                console.log(json);
            });
        }
    }
};
