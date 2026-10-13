import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  CreditCard,
  DollarSign,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/StatCard';
import Alert from '../../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAdminStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load live hospital statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading live hospital analytics...</div>;
  }

  // Prepare chart data
  const statusChartData = stats?.appointmentsByStatus
    ? Object.entries(stats.appointmentsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const deptChartData = stats?.doctorsByDepartment
    ? Object.entries(stats.doctorsByDepartment).map(([name, count]) => ({ name, count }))
    : [];

  const COLORS = ['#f59e0b', '#0284c7', '#10b981', '#ef4444'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Hospital Executive Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Real-time operational indicators, medical staff distribution, and clinical billing summary
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/doctors" className="btn btn-primary" id="btn-quick-add-doc">
            <Plus size={16} /> Manage Doctors
          </Link>
          <Link to="/admin/billing" className="btn btn-secondary" id="btn-quick-billing">
            <CreditCard size={16} /> Billing Center
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Registered Patients"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="blue"
          subtext="Active patient profiles"
        />
        <StatCard
          title="Active Doctors"
          value={stats?.totalDoctors || 0}
          icon={UserCheck}
          color="teal"
          subtext="Credentialed medical staff"
        />
        <StatCard
          title="Departments"
          value={stats?.totalDepartments || 0}
          icon={Building2}
          color="purple"
          subtext="Specialty clinics"
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          icon={Calendar}
          color="green"
          subtext="Scheduled for today"
        />
      </div>

      <div className="stats-grid">
        <StatCard
          title="Pending Appointments"
          value={stats?.pendingAppointments || 0}
          icon={Clock}
          color="amber"
          subtext="Awaiting doctor/admin confirmation"
        />
        <StatCard
          title="Completed Consultations"
          value={stats?.completedAppointments || 0}
          icon={CheckCircle}
          color="green"
          subtext="Successfully finalized"
        />
        <StatCard
          title="Total Revenue Collected"
          value={`$${Number(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="teal"
          subtext="Settled invoice payments"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${Number(stats?.outstandingAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={CreditCard}
          color="red"
          subtext={`${stats?.outstandingInvoices || 0} unpaid/partially paid`}
        />
      </div>

      {/* Visual Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Appointments by Status */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">Appointments Distribution by Status</div>
          </div>
          <div style={{ height: '300px' }}>
            {statusChartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No appointment history records yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Doctors by Department */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">Physician Capacity by Department</div>
          </div>
          <div style={{ height: '300px' }}>
            {deptChartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No department data found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Doctors" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Administrative Operations Quick Access</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Link to="/admin/doctors" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
            <span>Manage Doctors Directory</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/admin/patients" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
            <span>Search Patient Records</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/admin/appointments" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
            <span>Manage All Appointments</span>
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/admin/audit-logs" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
            <span>Review System Audit Logs</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
