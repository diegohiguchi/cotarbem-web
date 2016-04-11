'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Cotaco Schema
 */
var CotacaoSchema = new Schema({
    produtos: [{
        nome: {
            type: String,
            default: '',
            required: 'Informe o nome do Produto',
            trim: true
        },
        codigo: {
            type: String,
            default: '',
            trim: true
        },
        /*tipoCotacao: {
            type: String,
            enum: ['Unidade', 'Caixa']
        },*/
        unidadeMedida:{
            type: String,
            default: '',
            required: 'Informe a unidade de medida',
            trim: true
        },
        quantidade: {
            type: Number,
            default: 1,
            required: 'Informe a Quantidade',
        },
        disponivel: {
            default: false,
            type: Boolean
        },
        imagemURL: {
            type: String,
            default: '',
        },
        dataEntrega: Date,
        valor: Number,
        observacao: {
            type: String,
            default: '',
            trim: true
        }
    }],
    dataCadastro: {
        type: Date,
        default: Date.now
    },
    solicitacao: {
        type: Schema.ObjectId,
        ref: 'Solicitacoes'
    },
    subSegmento: {
        type: Schema.ObjectId,
        ref: 'Subsegmento'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Cotacoes', CotacaoSchema);
