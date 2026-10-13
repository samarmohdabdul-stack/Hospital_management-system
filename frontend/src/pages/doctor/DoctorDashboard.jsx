import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Pill, CheckCircle, Clock, Stethoscope, ArrowRight } from 'lucide-react';
import { appointmentService, doctorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileRes = await doctorService.getMe();
      setProfile(profileRes.data);

      const appRes = await appointmentService.getAll({
        doctorId: profileRes.data.id,
        size: 20,
      });

      const list = appRes.data.content || [];
      const todayStr = new Date().toISOString().split('T')[0];
      const todayList = list.filter((a) => a.appointmentDate === todayStr);

      setTodayAppointments(todayList);
      setStats({
        total: list.length,
        pending: list.filter((a) => a.status === 'PENDING').length,
        completed: list.filter((a) => a.status === 'COMPLETED').length,
      });
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load doctor dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      const res = await doctorService.updateAvailability(profile.id, !profile.available);
      setProfile(res.data);
      setAlert({ type: 'success', message: `Status updated to ${res.data.available ? 'Available' : 'Unavailable'}` });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update availability.' });
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading physician workspace...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Welcome, Dr. {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            {profile?.departmentName} Department | {profile?.specialization} ({profile?.qualification})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className={`btn ${profile?.available ? 'btn-secondary' : 'btn-outline'}`}
            onClick={handleToggleAvailability}
            id="btn-doc-toggle-availability"
          >
            Status: {profile?.available ? '● Available for Consults' : '○ Unavailable'}
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Assigned Patients"
          value={stats.total}
          icon={Users}
          color="blue"
          subtext="Consultation schedule"
        />
        <StatCard
          title="Today's Consultations"
          value={todayAppointments.length}
          icon={Calendar}
          color="teal"
          subtext="Appointments today"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pending}
          icon={Clock}
          color="amber"
          subtext="Awaiting review"
        />
        <StatCard
          title="Completed Cases"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
          subtext="Closed clinical cases"
        />
      </div>

      {/* Quick Clinical Workflows */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">Physician Action Center</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <Link to="/doctor/appointments" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
            <span>Review Full Appointment Schedule</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/doctor/patients" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
            <span>Patient Consultation Notes</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/doctor/prescriptions" className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '1rem' }}>
            <span>Issue Electronic Prescriptions</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Today's Scheduled Consultations</h3>
          <Link to="/doctor/appointments" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            View All Schedule →
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient Name</th>
                <th>Contact</th>
                <th>Reason for Visit</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No consultations scheduled for today.
                  </td>
                </tr>
              ) : (
                todayAppointments.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{app.appointmentTime}</td>
                    <td style={{ fontWeight: 600 }}>{app.patientName}</td>
                    <td>{app.patientPhone || 'N/A'}</td>
                    <td>{app.reasonForVisit || 'Regular consultation'}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to="/doctor/appointments" className="btn btn-outline btn-sm">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
