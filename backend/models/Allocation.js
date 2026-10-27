const mongoose = require('mongoose');

// applied -> faculty-approved -> allocated   (or rejected at any stage)
module.exports = mongoose.model('Allocation', new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  projectTitle: String,
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyName: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  rollNo: String,
  status: { type: String, enum: ['applied', 'faculty-approved', 'allocated', 'rejected'], default: 'applied' },
  remark: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}));
