const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  month: { type: String, required: true }, // Format: "YYYY-MM"
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  paidLeave: { type: Number, default: 0 },
  unpaidLeave: { type: Number, default: 0 },
  totalWorkingDays: { type: Number, default: 26 },
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
