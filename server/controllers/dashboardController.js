const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');

exports.getStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const currentMonth = new Date().toISOString().slice(0, 7);

    const currentPayrolls = await Payroll.find({ month: currentMonth });
    const totalPayrollThisMonth = currentPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalPaid = currentPayrolls.filter(p => p.status === 'paid').length;

    // Last 6 months payroll chart data
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().slice(0, 7);
      const payrolls = await Payroll.find({ month: monthStr });
      const total = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
      chartData.push({
        month: monthStr,
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        total: Math.round(total),
        count: payrolls.length
      });
    }

    // Department-wise employee count
    const departments = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalEmployees,
      totalPayrollThisMonth: Math.round(totalPayrollThisMonth),
      payrollGenerated: currentPayrolls.length,
      totalPaid,
      chartData,
      departments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
