'use strict';

/**
 * Module dependencies
 */
var cotacoesPolicy = require('../policies/cotacoes.server.policy'),
    notificacao = require('../controllers/notificacoes.server.controller');

module.exports = function(app) {

    app.route('/api/notificacao/fornecedores').post(notificacao.notificarFornecedores);
    app.route('/api/notificacao/cliente').post(notificacao.notificarCliente);
    app.route('/api/notificacao/fornecedores/produtos').post(notificacao.notificarFornecedoresProdutos);
};
