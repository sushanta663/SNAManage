const mongoose = require('mongoose');

module.exports = mongoose.model('Request', new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  rollNo: String,
  level: String,
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  steps: [String],                 // copy of the workflow path, e.g. ['faculty','hod']
  currentStep: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  history: [{
    by: String, role: String, action: String, remark: String,
    at: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}));
