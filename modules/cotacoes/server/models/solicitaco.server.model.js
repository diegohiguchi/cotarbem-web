'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Solicitacoes Schema
 */
var SolicitacaoSchema = new Schema({
  produtos: [{
    nome: {
      type: String,
      default: '',
      required: 'Informe o nome do produto',
      trim: true
    },
    codigo: {
      type: String,
      default: '',
      trim: true
    },
    /*tipoCotacao: {
      type: String,
      enum: ['Unidade', 'Caixa', 'kg', 'm', 'm²']
    },*/
    unidadeMedida:{
      type: String,
      default: '',
      required: 'Informe a unidade de medida',
      trim: true
    },
    quantidade: {
      type: Number,
      default: 0,
      required: 'Informe a Quantidade',
    },
    imagemURL: {
      type: String,
      default: ''
    },
    dataEntrega: Date
  }],
  dataCadastro: {
    type: Date,
    default: Date.now
  },
  tempo: String,
  subSegmento: {
    type: Schema.ObjectId,
    ref: 'Subsegmento'
  },
  ativo: {
    type: Boolean,
    default: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Solicitacoes', SolicitacaoSchema);
