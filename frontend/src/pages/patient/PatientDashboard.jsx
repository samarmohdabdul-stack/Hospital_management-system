import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Pill, CreditCard, Clock, FileText, ArrowRight, Plus } from 'lucide-react';
import { appointmentService, prescriptionService, billingService, patientService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patientProfile, setPatientProfile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const profileRes = await patientService.getMe();
      setPatientProfile(profileRes.data);

      const [appRes, rxRes, invRes] = await Promise.all([
        appointmentService.getAll({ patientId: profileRes.data.id, size: 5 }),
        prescriptionService.getPatientPrescriptions(profileRes.data.id),
        billingService.getInvoices({ patientId: profileRes.data.id, size: 5 }),
      ]);

      setUpcomingAppointments(appRes.data.content || []);
      setRecentPrescriptions(rxRes.data.slice(0, 3));
      const invList = invRes.data.content || [];
      setUnpaidInvoices(invList.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your healthcare portal...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Hello, {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Patient ID: #{patientProfile?.id} | Blood Group: {patientProfile?.bloodGroup || 'N/A'}
          </p>
        </div>

        <Link to="/patient/book" className="btn btn-primary" id="btn-patient-quick-book">
          <Plus size={16} /> Book Appointment
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Scheduled Appointments"
          value={upcomingAppointments.length}
          icon={Calendar}
          color="blue"
          subtext="Upcoming consultations"
        />
        <StatCard
          title="Digital Prescriptions"
          value={recentPrescriptions.length}
          icon={Pill}
          color="teal"
          subtext="Active prescriptions"
        />
        <StatCard
          title="Outstanding Bills"
          value={unpaidInvoices.length}
          icon={CreditCard}
          color={unpaidInvoices.length > 0 ? 'red' : 'green'}
          subtext={unpaidInvoices.length > 0 ? 'Payment required' : 'All accounts settled'}
        />
      </div>

      {/* Action Shortcut Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Need Medical Consultation?</h3>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: '0.35rem 0 0' }}>
              Explore certified physicians across Cardiology, Neurology, Pediatrics, Orthopedics, and more.
            </p>
          </div>
          <Link to="/patient/doctors" className="btn btn-secondary" style={{ background: '#ffffff', color: '#0284c7' }}>
            Browse Specialists <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Grid: Upcoming Appointments and Recent Prescriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Appointments Preview */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Upcoming Appointments</h3>
            <Link to="/patient/appointments" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {upcomingAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                No active appointments. Book one today!
              </p>
            ) : (
              upcomingAppointments.map((app) => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{app.doctorName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {app.departmentName} ({app.doctorSpecialization})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                      {app.appointmentDate} at {app.appointmentTime}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prescriptions Preview */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Digital Prescriptions</h3>
            <Link to="/patient/prescriptions" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <div style={{ padding: '1rem 1.5rem' }}>
            {recentPrescriptions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                No prescriptions on file yet.
              </p>
            ) : (
              recentPrescriptions.map((rx) => (
                <div key={rx.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{rx.doctorName}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rx.issueDate}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {rx.items?.length || 0} medications prescribed ({rx.items?.map((i) => i.medicationName).join(', ')})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
