'use strict';

/**
 * Module dependencies
 */
var cotacoesPolicy = require('../policies/cotacoes.server.policy'),
    cotacoes = require('../controllers/cotacoes.server.controller');

module.exports = function(app) {

    app.route('/api/cotacoes/obterPorSolicitacaoId/:id').get(cotacoes.cotacaoSolicitacaoByID);
    app.route('/api/cotacoes/solicitacao').post(cotacoes.cotacaoSolicitacaoByID);
    app.route('/api/cotacoes/exportarParaExcel').post(cotacoes.exrpotarParaExcel);

    // Cotacoes Routes
    app.route('/api/cotacoes').all(cotacoesPolicy.isAllowed)
        .get(cotacoes.list)
        .post(cotacoes.create);

    app.route('/api/cotacoes/:cotacaoId').all(cotacoesPolicy.isAllowed)
        .get(cotacoes.read)
        .put(cotacoes.update)
        .delete(cotacoes.delete);

    app.param('cotacaoId', cotacoes.cotacaoByID);
};
