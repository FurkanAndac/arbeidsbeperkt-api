// models/WachtlijstFormulier.js
const mongoose = require('mongoose');

const wachtlijstFormulierSchema = new mongoose.Schema({
  name: String,
  email: String,
  formData: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['pending', 'accepted', 'denied'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WachtlijstFormulier', wachtlijstFormulierSchema);
