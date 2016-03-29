'use strict';

/**
 * Module dependencies
 */
var solicitacoesPolicy = require('../policies/solicitacoes.server.policy'),
  solicitacoes = require('../controllers/solicitacoes.server.controller');

module.exports = function(app) {
  // Solicitacoes Routes
  app.route('/api/solicitacoes').all(solicitacoesPolicy.isAllowed)
    .get(solicitacoes.list)
    .post(solicitacoes.create);

  app.route('/api/solicitacoesPorSubSegmentos').all(solicitacoesPolicy.isAllowed)
      .get(solicitacoes.listaPorSubSegmentos);

  app.route('/api/solicitacoes/:solicitacaoId').all(solicitacoesPolicy.isAllowed)
    .get(solicitacoes.read)
    .put(solicitacoes.update)
    .delete(solicitacoes.delete);

 /* app.route('/api/cotacoes/solicitacao/:solicitacaoId').all(solicitacoesPolicy.isAllowed)
      .get(solicitacoes.cotacaoSolicitacaoByID)
      .get(solicitacoes.list)
      .get(solicitacoes.read);*/

  // Finish by binding the Solicitacao middleware
  app.param('solicitacaoId', solicitacoes.solicitacaoByID);
};
