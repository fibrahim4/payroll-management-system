import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb923c'];

const fmt = (n) => `$${n?.toLocaleString() ?? 0}`;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your payroll operations</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Employees</div>
          <div className="stat-value" style={{ color: '#38bdf8' }}>{stats?.totalEmployees ?? 0}</div>
          <div className="stat-sub">On active payroll</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month's Total</div>
          <div className="stat-value" style={{ color: '#34d399' }}>{fmt(stats?.totalPayrollThisMonth)}</div>
          <div className="stat-sub">Net salaries</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Payrolls Generated</div>
          <div className="stat-value" style={{ color: '#a78bfa' }}>{stats?.payrollGenerated ?? 0}</div>
          <div className="stat-sub">Current month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid Out</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{stats?.totalPaid ?? 0}</div>
          <div className="stat-sub">Marked as paid</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 8, fontSize: 15, fontWeight: 600 }}>6-Month Payroll Trend</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>Net salaries distributed</p>
          <div className="chart-wrapper" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="label" stroke="#4a5568" fontSize={11} />
                <YAxis stroke="#4a5568" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#141d2e', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 13 }}
                  formatter={(v) => [fmt(v), 'Net Payroll']}
                />
                <Bar dataKey="total" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 8, fontSize: 15, fontWeight: 600 }}>Employees by Department</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>Headcount distribution</p>
          {stats?.departments?.length > 0 ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departments}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ _id, count }) => `${_id} (${count})`}
                    labelLine={{ stroke: '#4a5568' }}
                    fontSize={11}
                  >
                    {stats.departments.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#141d2e', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">📊</div>
              <p>No department data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
