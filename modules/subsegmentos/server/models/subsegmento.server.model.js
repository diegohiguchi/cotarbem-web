'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Subsegmento Schema
 */
var SubsegmentoSchema = new Schema({
  nome: {
    type: String,
    default: '',
    required: 'Informe o nome do Sub-Segmento',
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
  },
  segmento: {
    type: Schema.ObjectId,
    ref: 'Segmento'
  }
});

mongoose.model('Subsegmento', SubsegmentoSchema);
