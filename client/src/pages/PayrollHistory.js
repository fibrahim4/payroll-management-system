import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PayrollHistory() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  const load = async () => {
    const params = monthFilter ? `?month=${monthFilter}` : '';
    const { data } = await api.get(`/payroll${params}`);
    setPayrolls(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [monthFilter]);

  const handleDownload = async (p) => {
    try {
      const response = await api.get(`/payroll/${p._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${p.employeeId}-${p.month}.pdf`;
      a.click();
    } catch {
      toast.error('Download failed');
    }
  };

  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const filtered = payrolls.filter(p =>
    p.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
    p.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    p.department?.toLowerCase().includes(search.toLowerCase())
  );

  const totalNet = filtered.reduce((s, p) => s + (p.netSalary || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h2>Payroll History</h2>
        <p>View and download past payroll records and payslips</p>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search by name, ID, department..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="search-input" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {filtered.length > 0 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', gap: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Space Mono' }}>Records Shown</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 20, fontWeight: 700, marginTop: 4 }}>{filtered.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'Space Mono' }}>Total Net Payout</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 20, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>${totalNet.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading history...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th><th>Employee</th><th>Department</th>
                  <th>Gross</th><th>Tax</th><th>Net Salary</th>
                  <th>Attendance</th><th>Status</th><th>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9}><div className="empty-state"><div className="icon">🗂️</div><p>No payroll records found</p></div></td></tr>
                ) : filtered.map(p => (
                  <tr key={p._id}>
                    <td><span className="mono" style={{ color: 'var(--accent)', fontSize: 12 }}>{p.month}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.employeeName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.employeeId}</div>
                    </td>
                    <td>{p.department}</td>
                    <td><span className="mono">${p.grossSalary?.toLocaleString()}</span></td>
                    <td><span className="mono" style={{ color: 'var(--danger)' }}>${p.taxAmount?.toFixed(0)}</span></td>
                    <td><span className="mono" style={{ color: 'var(--success)', fontWeight: 700 }}>${p.netSalary?.toLocaleString()}</span></td>
                    <td><span className="mono">{p.presentDays}/{p.totalWorkingDays}</span></td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(p)}>⬇ PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
