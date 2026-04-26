import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(thisMonth());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employeeId: '', month: thisMonth(), presentDays: 26, absentDays: 0, paidLeave: 0, unpaidLeave: 0, totalWorkingDays: 26 });
  const { isAdmin } = useAuth();

  const load = async () => {
    const [empRes, attRes] = await Promise.all([
      api.get('/employees'),
      api.get(`/attendance?month=${month}`)
    ]);
    setEmployees(empRes.data);
    setAttendance(attRes.data);
  };

  useEffect(() => { load(); }, [month]);

  const getAtt = (empId) => attendance.find(a => a.employeeId === empId);

  const openModal = (emp) => {
    const att = getAtt(emp.employeeId);
    setForm({
      employeeId: emp.employeeId,
      month,
      presentDays: att?.presentDays ?? 26,
      absentDays: att?.absentDays ?? 0,
      paidLeave: att?.paidLeave ?? 0,
      unpaidLeave: att?.unpaidLeave ?? 0,
      totalWorkingDays: att?.totalWorkingDays ?? 26,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', form);
      toast.success('Attendance saved');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving attendance');
    }
  };

  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  return (
    <div>
      <div className="page-header">
        <h2>Attendance Tracking</h2>
        <p>Record and manage monthly attendance for payroll calculations</p>
      </div>

      <div className="toolbar">
        <select className="search-input" value={month} onChange={e => setMonth(e.target.value)} style={{ minWidth: 160 }}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Department</th><th>Present</th><th>Absent</th>
                <th>Paid Leave</th><th>Unpaid Leave</th><th>Total Days</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="icon">📅</div><p>No employees found</p></div></td></tr>
              ) : employees.filter(e => e.status === 'active').map(emp => {
                const att = getAtt(emp.employeeId);
                return (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.employeeId}</div>
                    </td>
                    <td>{emp.department}</td>
                    <td><span className="mono" style={{ color: 'var(--success)' }}>{att?.presentDays ?? '—'}</span></td>
                    <td><span className="mono" style={{ color: 'var(--danger)' }}>{att?.absentDays ?? '—'}</span></td>
                    <td><span className="mono" style={{ color: 'var(--accent)' }}>{att?.paidLeave ?? '—'}</span></td>
                    <td><span className="mono" style={{ color: 'var(--warning)' }}>{att?.unpaidLeave ?? '—'}</span></td>
                    <td><span className="mono">{att?.totalWorkingDays ?? '26'}</span></td>
                    {isAdmin && (
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openModal(emp)}>
                          {att ? 'Edit' : 'Record'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Record Attendance — {form.employeeId}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label>Total Working Days</label>
                  <input type="number" value={form.totalWorkingDays} onChange={e => setForm({...form, totalWorkingDays: +e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Present Days</label>
                  <input type="number" value={form.presentDays} onChange={e => setForm({...form, presentDays: +e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Absent Days</label>
                  <input type="number" value={form.absentDays} onChange={e => setForm({...form, absentDays: +e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Paid Leave</label>
                  <input type="number" value={form.paidLeave} onChange={e => setForm({...form, paidLeave: +e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Unpaid Leave</label>
                  <input type="number" value={form.unpaidLeave} onChange={e => setForm({...form, unpaidLeave: +e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
