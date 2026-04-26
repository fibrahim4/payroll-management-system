const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const PDFDocument = require('pdfkit');

exports.generate = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, bonus = 0, extraDeductions = 0 } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const attendance = await Attendance.findOne({ employeeId, month });
    const totalWorkingDays = attendance?.totalWorkingDays || 26;
    const presentDays = attendance?.presentDays || totalWorkingDays;
    const unpaidLeave = attendance?.unpaidLeave || 0;

    // Salary calculation
    const perDaySalary = employee.basicSalary / totalWorkingDays;
    const unpaidLeaveDeduction = perDaySalary * unpaidLeave;
    const grossSalary = employee.basicSalary + employee.hra + employee.allowances + Number(bonus);
    const taxAmount = (employee.taxPercentage / 100) * grossSalary;
    const netSalary = grossSalary - taxAmount - unpaidLeaveDeduction - Number(extraDeductions);

    const payroll = await Payroll.findOneAndUpdate(
      { employeeId, month },
      {
        employeeId, month,
        employeeName: employee.fullName,
        department: employee.department,
        designation: employee.designation,
        basicSalary: employee.basicSalary,
        hra: employee.hra,
        allowances: employee.allowances,
        bonus: Number(bonus),
        grossSalary,
        deductions: Number(extraDeductions),
        taxAmount,
        unpaidLeaveDeduction,
        netSalary,
        presentDays,
        totalWorkingDays,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { month, employeeId } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (employeeId) filter.employeeId = employeeId;
    const payrolls = await Payroll.find(filter).sort({ month: -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, { status: 'paid' }, { new: true });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payroll.employeeId}-${payroll.month}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#1a1a2e').text('PAYSLIP', { align: 'center' });
    doc.fontSize(12).fillColor('#555').text('PayrollPro Management System', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown();

    // Employee Info
    doc.fontSize(11).fillColor('#333');
    doc.text(`Employee ID: ${payroll.employeeId}`, 50);
    doc.text(`Name: ${payroll.employeeName}`);
    doc.text(`Department: ${payroll.department}`);
    doc.text(`Designation: ${payroll.designation}`);
    doc.text(`Pay Period: ${payroll.month}`);
    doc.text(`Attendance: ${payroll.presentDays} / ${payroll.totalWorkingDays} days`);
    doc.moveDown();

    // Earnings table
    doc.fontSize(13).fillColor('#1a1a2e').text('Earnings', { underline: true });
    doc.fontSize(11).fillColor('#333');
    doc.text(`Basic Salary:          $${payroll.basicSalary.toFixed(2)}`);
    doc.text(`HRA:                   $${payroll.hra.toFixed(2)}`);
    doc.text(`Allowances:            $${payroll.allowances.toFixed(2)}`);
    doc.text(`Bonus:                 $${payroll.bonus.toFixed(2)}`);
    doc.text(`Gross Salary:          $${payroll.grossSalary.toFixed(2)}`);
    doc.moveDown();

    // Deductions table
    doc.fontSize(13).fillColor('#1a1a2e').text('Deductions', { underline: true });
    doc.fontSize(11).fillColor('#333');
    doc.text(`Tax (${(payroll.taxAmount / payroll.grossSalary * 100).toFixed(1)}%): $${payroll.taxAmount.toFixed(2)}`);
    doc.text(`Unpaid Leave:          $${payroll.unpaidLeaveDeduction.toFixed(2)}`);
    doc.text(`Other Deductions:      $${payroll.deductions.toFixed(2)}`);
    doc.moveDown();

    // Net Salary
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#16213e').text(`NET SALARY: $${payroll.netSalary.toFixed(2)}`, { bold: true });
    doc.moveDown();

    doc.fontSize(9).fillColor('#aaa').text(`Generated on ${new Date(payroll.generatedAt).toLocaleDateString()}`, { align: 'right' });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
