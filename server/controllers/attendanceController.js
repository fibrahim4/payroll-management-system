const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.getAll = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { month } : {};
    const attendance = await Attendance.find(filter);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByEmployee = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employeeId: req.params.id }).sort({ month: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { employeeId, month, presentDays, absentDays, paidLeave, unpaidLeave, totalWorkingDays } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, month },
      { presentDays, absentDays, paidLeave, unpaidLeave, totalWorkingDays: totalWorkingDays || 26 },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
