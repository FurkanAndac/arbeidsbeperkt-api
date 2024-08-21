// models/Favorite.js

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  entryIds: [{ type: String, required: true }],  // Changed entryId to entryIds as an array
}, { timestamps: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;

