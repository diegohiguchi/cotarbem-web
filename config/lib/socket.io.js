'use strict';

// Load the module dependencies
var config = require('../config'),
    path = require('path'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    cookieParser = require('cookie-parser'),
    passport = require('passport'),
    socketio = require('socket.io'),
    session = require('express-session'),
    _ = require('underscore'),
    MongoStore = require('connect-mongo')(session);

// Define the Socket.io configuration method
module.exports = function (app, db) {
    var server;
    var usuarios = [];

    if (config.secure && config.secure.ssl === true) {
        // Load SSL key and certificate
        var privateKey = fs.readFileSync(path.resolve(config.secure.privateKey), 'utf8');
        var certificate = fs.readFileSync(path.resolve(config.secure.certificate), 'utf8');
        var options = {
            key: privateKey,
            cert: certificate,
            //  requestCert : true,
            //  rejectUnauthorized : true,
            secureProtocol: 'TLSv1_method',
            ciphers: [
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-ECDSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-ECDSA-AES256-GCM-SHA384',
                'DHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES128-SHA256',
                'DHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA384',
                'DHE-RSA-AES256-SHA384',
                'ECDHE-RSA-AES256-SHA256',
                'DHE-RSA-AES256-SHA256',
                'HIGH',
                '!aNULL',
                '!eNULL',
                '!EXPORT',
                '!DES',
                '!RC4',
                '!MD5',
                '!PSK',
                '!SRP',
                '!CAMELLIA'
            ].join(':'),
            honorCipherOrder: true
        };

        // Create new HTTPS Server
        server = https.createServer(options, app);
    } else {
        // Create a new HTTP server
        server = http.createServer(app);
    }
    // Create a new Socket.io server
    var io = socketio.listen(server);

    // Create a MongoDB storage object
    var mongoStore = new MongoStore({
        mongooseConnection: db.connection,
        collection: config.sessionCollection
    });

    // Intercept Socket.io's handshake request
    io.use(function (socket, next) {
        // Use the 'cookie-parser' module to parse the request cookies
        cookieParser(config.sessionSecret)(socket.request, {}, function (err) {
            // Get the session id from the request cookies
            var sessionId = socket.request.signedCookies ? socket.request.signedCookies[config.sessionKey] : undefined;

            if (!sessionId) return next(new Error('sessionId was not found in socket.request'), false);

            // Use the mongoStorage instance to get the Express session information
            mongoStore.get(sessionId, function (err, session) {
                if (err) return next(err, false);
                if (!session) return next(new Error('session was not found for ' + sessionId), false);

                // Set the Socket.io session information
                socket.request.session = session;

                // Use Passport to populate the user details
                passport.initialize()(socket.request, {}, function () {
                    passport.session()(socket.request, {}, function () {
                        if (socket.request.user) {
                            next(null, true);
                        } else {
                            next(new Error('User is not authenticated'), false);
                        }
                    });
                });
            });
        });
    });

    // Add an event listener to the 'connection' event
    io.on('connection', function (socket) {
        config.files.server.sockets.forEach(function (socketConfiguration) {
            require(path.resolve(socketConfiguration))(io, socket);
        });

        socket.on('adiciona-usuario', function (user) {
            var usuarioSocket = _.find(usuarios, function(usuario){
                return usuario._id === user._id;
            });

            if (!usuarioSocket) {
                user.socketId = socket.id;
                usuarios.push(user);
            } else{
                //usuarioSocket.socketId = socket.id;
            }
        });

        socket.on('carrega-subSegmentos', function (subSegmentos) {
            socket.join(subSegmentos);
        });

        socket.on('nova-solicitacao', function (novaSolicitacao) {
            var data = {
                mensagem: 'Cotação em aberto',
                solicitacao: novaSolicitacao,
                ativo: true,
                tipo: 'Cotação aberta',
                dataEnviada: new Date()
            }

            io.in(data.solicitacao.subSegmento).emit('envia-solicitacao', {
                solicitacao: data.solicitacao,
                mensagem: data.mensagem,
                ativo: data.ativo,
                tipo: data.tipo,
                data: data.dataEnviada
            });
        });

        socket.on('cotacao-encerrada', function (solicitacao) {
            var data = {
                mensagem: 'Cotação encerrada',
                ativo: true,
                tipo: 'Cotação encerrada',
                dataEnviada: new Date()
            }

            var usuario = _.find(usuarios, function(usuario){
                return usuario._id === solicitacao.user._id;
            });

            var mensagem = {
                mensagem: data.mensagem,
                ativo: data.ativo,
                tipo: data.tipo,
                data: data.dataEnviada
            };


            if(!_.isEmpty(usuario)) {
                io.in(solicitacao.subSegmento._id).emit('envia-cotacao-encerrada', mensagem);
                io.to(usuario.socketId).emit('envia-cotacao-encerrada', mensagem);
            }
            /*else {
             io.in(solicitacao.subSegmento).emit('envia-cotacao-encerrada', criarMensagem);
             }*/

        });
    });



    return server;
};
