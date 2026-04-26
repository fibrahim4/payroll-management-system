const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  taxPercentage: { type: Number, default: 10 },
  bankAccountNumber: { type: String },
  bankName: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
