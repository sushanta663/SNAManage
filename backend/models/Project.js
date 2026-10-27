const mongoose = require('mongoose');

module.exports = mongoose.model('Project', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  level: { type: String, enum: ['UG', 'PG'], required: true },
  slots: { type: Number, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyName: String,
  createdAt: { type: Date, default: Date.now }
}));
