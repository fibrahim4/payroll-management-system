const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String },
  designation: { type: String },
  month: { type: String, required: true }, // Format: "YYYY-MM"
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true },
  deductions: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  unpaidLeaveDeduction: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  presentDays: { type: Number, default: 0 },
  totalWorkingDays: { type: Number, default: 26 },
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['generated', 'paid'], default: 'generated' },
}, { timestamps: true });

payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
