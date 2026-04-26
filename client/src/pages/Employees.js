import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales', 'Design', 'Legal'];

const emptyForm = {
  fullName: '', email: '', phone: '', department: 'Engineering', designation: '',
  joiningDate: '', basicSalary: '', hra: '', allowances: '', taxPercentage: '10',
  bankAccountNumber: '', bankName: '',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();

  const load = async () => {
    const { data } = await api.get('/employees');
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      fullName: emp.fullName, email: emp.email, phone: emp.phone || '',
      department: emp.department, designation: emp.designation,
      joiningDate: emp.joiningDate?.slice(0, 10) || '',
      basicSalary: emp.basicSalary, hra: emp.hra, allowances: emp.allowances,
      taxPercentage: emp.taxPercentage, bankAccountNumber: emp.bankAccountNumber || '',
      bankName: emp.bankName || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/employees/${editing.employeeId}`, form);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', form);
        toast.success('Employee added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving employee');
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.fullName}?`)) return;
    try {
      await api.delete(`/employees/${emp.employeeId}`);
      toast.success('Employee removed');
      load();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filtered = employees.filter(e =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h2>Employees</h2>
        <p>Manage your workforce and their salary structures</p>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Add Employee</button>}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Department</th><th>Designation</th>
                  <th>Basic Salary</th><th>Status</th>{isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><div className="icon">👥</div><p>No employees found</p></div></td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp._id}>
                    <td><span className="mono" style={{ color: 'var(--accent)', fontSize: 12 }}>{emp.employeeId}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td><span className="mono">${emp.basicSalary?.toLocaleString()}</span></td>
                    <td><span className={`badge badge-${emp.status}`}>{emp.status}</span></td>
                    {isAdmin && (
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 8900" />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select required value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation *</label>
                  <input required value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="Software Engineer" />
                </div>
                <div className="form-group">
                  <label>Joining Date *</label>
                  <input required type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Basic Salary ($) *</label>
                  <input required type="number" value={form.basicSalary} onChange={e => setForm({...form, basicSalary: e.target.value})} placeholder="5000" />
                </div>
                <div className="form-group">
                  <label>HRA ($)</label>
                  <input type="number" value={form.hra} onChange={e => setForm({...form, hra: e.target.value})} placeholder="500" />
                </div>
                <div className="form-group">
                  <label>Allowances ($)</label>
                  <input type="number" value={form.allowances} onChange={e => setForm({...form, allowances: e.target.value})} placeholder="200" />
                </div>
                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input type="number" value={form.taxPercentage} onChange={e => setForm({...form, taxPercentage: e.target.value})} placeholder="10" />
                </div>
                <div className="form-group">
                  <label>Bank Account No.</label>
                  <input value={form.bankAccountNumber} onChange={e => setForm({...form, bankAccountNumber: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
