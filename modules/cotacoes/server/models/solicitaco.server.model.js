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
      required: 'Informe o nome do Produto',
      trim: true
    },
    tipoCotacao: {
      type: String,
      enum: ['Unidade', 'Caixa']
    },
    quantidade: {
      type: Number,
      default: 0,
      required: 'Informe a Quantidade',
    },
    dataEntrega: Date
  }],
  dataCadastro: {
    type: Date,
    default: Date.now
  },
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
