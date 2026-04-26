import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(thisMonth());
  const [payrolls, setPayrolls] = useState([]);
  const [generating, setGenerating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [bonus, setBonus] = useState(0);
  const [extraDed, setExtraDed] = useState(0);

  const load = async () => {
    const [empRes, payRes] = await Promise.all([
      api.get('/employees'),
      api.get(`/payroll?month=${month}`)
    ]);
    setEmployees(empRes.data.filter(e => e.status === 'active'));
    setPayrolls(payRes.data);
  };

  useEffect(() => { load(); }, [month]);

  const getPayroll = (empId) => payrolls.find(p => p.employeeId === empId);

  const openGenerate = (emp) => {
    setSelectedEmp(emp);
    setBonus(0);
    setExtraDed(0);
    setShowModal(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(selectedEmp.employeeId);
    try {
      await api.post(`/payroll/generate/${selectedEmp.employeeId}`, { month, bonus, extraDeductions: extraDed });
      toast.success(`Payroll generated for ${selectedEmp.fullName}`);
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!window.confirm(`Generate payroll for ALL employees for ${month}?`)) return;
    let success = 0;
    for (const emp of employees) {
      try {
        await api.post(`/payroll/generate/${emp.employeeId}`, { month, bonus: 0, extraDeductions: 0 });
        success++;
      } catch (_) {}
    }
    toast.success(`Generated ${success}/${employees.length} payrolls`);
    load();
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/payroll/${id}/pay`);
      toast.success('Marked as paid');
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleDownload = async (id) => {
    const response = await api.get(`/payroll/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${id}.pdf`;
    a.click();
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
        <h2>Generate Payroll</h2>
        <p>Calculate and process monthly salaries for all employees</p>
      </div>

      <div className="toolbar">
        <select className="search-input" value={month} onChange={e => setMonth(e.target.value)} style={{ minWidth: 160 }}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button className="btn btn-primary" onClick={handleGenerateAll}>⚡ Generate All</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Department</th><th>Basic</th><th>Gross</th>
                <th>Tax</th><th>Net Salary</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="icon">💰</div><p>No active employees</p></div></td></tr>
              ) : employees.map(emp => {
                const p = getPayroll(emp.employeeId);
                return (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.employeeId}</div>
                    </td>
                    <td>{emp.department}</td>
                    <td><span className="mono">${emp.basicSalary?.toLocaleString()}</span></td>
                    <td><span className="mono" style={{ color: 'var(--accent)' }}>{p ? `$${p.grossSalary?.toLocaleString()}` : '—'}</span></td>
                    <td><span className="mono" style={{ color: 'var(--danger)' }}>{p ? `$${p.taxAmount?.toFixed(0)}` : '—'}</span></td>
                    <td><span className="mono" style={{ color: 'var(--success)', fontWeight: 700 }}>{p ? `$${p.netSalary?.toLocaleString()}` : '—'}</span></td>
                    <td>{p ? <span className={`badge badge-${p.status}`}>{p.status}</span> : <span className="badge" style={{ background: '#4a556820', color: 'var(--text-muted)' }}>pending</span>}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => openGenerate(emp)} disabled={generating === emp.employeeId}>
                          {p ? '↺ Regen' : '+ Generate'}
                        </button>
                        {p && p.status === 'generated' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(p._id)}>Mark Paid</button>
                        )}
                        {p && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(p._id)}>⬇ PDF</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedEmp && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>Generate Payroll</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>{selectedEmp.fullName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{selectedEmp.designation} · {selectedEmp.department}</div>
              <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Basic: <span className="mono">${selectedEmp.basicSalary?.toLocaleString()}</span></div>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label>Bonus ($)</label>
                  <input type="number" value={bonus} onChange={e => setBonus(e.target.value)} min="0" placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Extra Deductions ($)</label>
                  <input type="number" value={extraDed} onChange={e => setExtraDed(e.target.value)} min="0" placeholder="0" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Payslip</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
