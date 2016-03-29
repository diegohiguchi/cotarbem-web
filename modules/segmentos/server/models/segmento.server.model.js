'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Segmento Schema
 */
var SegmentoSchema = new Schema({
  nome: {
    type: String,
    default: '',
    required: 'Informe o nome do Segmento',
    trim: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now
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

mongoose.model('Segmento', SegmentoSchema);
