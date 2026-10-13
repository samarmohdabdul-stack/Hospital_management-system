import React, { useEffect, useState } from 'react';
import { Calendar, Clock, XCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentService, patientService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    patientService.getMe().then((res) => {
      setPatientProfile(res.data);
      loadAppointments(res.data.id);
    }).catch(console.error);
  }, []);

  const loadAppointments = async (patientId) => {
    try {
      setLoading(true);
      const res = await appointmentService.getAll({ patientId, size: 50 });
      setAppointments(res.data.content || []);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load your appointments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      setAlert({ type: 'success', message: 'Appointment has been cancelled.' });
      if (patientProfile) loadAppointments(patientProfile.id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel appointment.';
      setAlert({ type: 'error', message: msg });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>My Clinical Appointments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            View status, dates, and physician information for your appointments
          </p>
        </div>

        <Link to="/patient/book" className="btn btn-primary">
          <Plus size={16} /> Book New Appointment
        </Link>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    You have no appointment bookings yet.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{app.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{app.doctorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.doctorSpecialization}</div>
                    </td>
                    <td>{app.departmentName}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.appointmentTime}</div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{app.reasonForVisit || 'General consultation'}</div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' ? (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                          onClick={() => handleCancel(app.id)}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No actions</span>
                      )}
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
