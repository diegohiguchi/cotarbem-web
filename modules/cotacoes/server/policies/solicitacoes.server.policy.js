'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Solicitacoes Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin', 'cliente', 'fornecedor'],
    allows: [{
      resources: '/api/solicitacoes',
      permissions: '*'
    }, {
      resources: '/api/solicitacoes/:solicitacaoId',
      permissions: ['*']
    }]
  }, {
    roles: ['admin', 'cliente', 'fornecedor'],
    allows: [{
      resources: '/api/solicitacoes',
      permissions: ['get', 'post']
    }, {
      resources: '/api/solicitacoes/:solicitacaoId',
      permissions: ['get']
    }]
  }, {
    roles: ['admin', 'cliente', 'fornecedor'],
    allows: [{
      resources: '/api/cotacoes/solicitacao/:solicitacaoId',
      permissions: ['get']
    }]
  }, {
    roles: ['admin', 'cliente', 'fornecedor'],
    allows: [{
      resources: '/api/solicitacoes',
      permissions: ['get']
    }, {
      resources: '/api/solicitacoes/:solicitacaoId',
      permissions: ['get']
    }]
  }, {
    roles: ['admin', 'fornecedor'],
    allows: [{
      resources: '/api/solicitacoesPorSubSegmentos',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/solicitacoes',
      permissions: ['get']
    }, {
      resources: '/api/solicitacoes/:solicitacaoId',
      permissions: ['get']
    }]
}]);
};

/**
 * Check If Solicitacoes Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Solicitacoes is being processed and the current user created it then allow any manipulation
  if (req.solicitacoes && req.user && req.solicitacoes.user && req.solicitacoes.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
