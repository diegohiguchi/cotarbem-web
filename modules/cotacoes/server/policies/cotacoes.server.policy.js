'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Cotacoes Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin', 'fornecedor', 'cliente'],
        allows: [{
            resources: '/api/cotacoes',
            permissions: '*'
        }, {
            resources: '/api/cotacoes/:cotacaoId',
            permissions: '*'
        }, {
            resources: '/api/cotacoes/obterPorSolicitacaoId/:solicitacaoId',
            permissions: ['*']
        }]
    },{
        roles: ['guest'],
        allows: [{
            resources: '/api/cotacoes',
            permissions: ['get']
        }, {
            resources: '/api/cotacoes/:cotacaoId',
            permissions: ['get']
        }, {
            resources: '/api/cotacoes/solicitacao/:solicitacaoId',
            permissions: ['get']
        }]
    }]);
  /*acl.allow([{
    roles: ['admin', 'fornecedor'],
    allows: [{
      resources: '/api/cotacoes',
      permissions: '*'
    }, {
      resources: '/api/cotacoes/:cotacaoId',
      permissions: '*'
    }, {
        resources: '/api/cotacoes/andamento/:solicitacaoId',
        permissions: ['*']
    }]
  }, {
    roles: ['admin', 'fornecedor'],
    allows: [{
      resources: '/api/cotacoes',
      permissions: ['get', 'post']
    }, {
      resources: '/api/cotacoes/:cotacaoId',
      permissions: ['get']
    }, {
        resources: '/api/cotacoes/andamento/:solicitacaoId',
        permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/cotacoes',
      permissions: ['get']
    }, {
      resources: '/api/cotacoes/:cotacaoId',
      permissions: ['get']
    }, {
        resources: '/api/cotacoes/andamento/:solicitacaoId',
        permissions: ['get']
    }]
  }]);*/
};

/**
 * Check If Cotacoes Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Cotacao is being processed and the current user created it then allow any manipulation
  if (req.cotacoes && req.user && req.cotacoes.user && req.cotacoes.user.id === req.user.id) {
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
