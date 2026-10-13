import React, { useEffect, useState } from 'react';
import { Calendar, Filter, CheckCircle, XCircle, Clock, Check } from 'lucide-react';
import { appointmentService, doctorService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Alert from '../../components/Alert';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    doctorService.getAll({ size: 100 })
      .then((res) => setDoctors(res.data.content || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, doctorFilter, dateFilter, currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 8,
        status: statusFilter || undefined,
        doctorId: doctorFilter || undefined,
        date: dateFilter || undefined,
      };
      const res = await appointmentService.getAll(params);
      setAppointments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load appointments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      setAlert({ type: 'success', message: `Appointment #${id} updated to ${newStatus}.` });
      fetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update appointment status.';
      setAlert({ type: 'error', message: msg });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Appointment Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Monitor and coordinate hospital appointment bookings, schedules, and confirmations
          </p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Status Filter</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
              id="filter-appointment-status"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="form-label">Doctor Filter</label>
            <select
              className="form-control"
              value={doctorFilter}
              onChange={(e) => { setDoctorFilter(e.target.value); setCurrentPage(0); }}
              id="filter-appointment-doctor"
            >
              <option value="">All Doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName} ({doc.specialization})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Date Filter</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(0); }}
              id="filter-appointment-date"
            />
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Appt #</th>
                <th>Patient</th>
                <th>Doctor & Dept</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Update Status</th>
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
                    No appointments matching the selected filters.
                  </td>
                </tr>
              ) : (
                appointments.map((app) => (
                  <tr key={app.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{app.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.patientPhone || 'No phone'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.doctorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.departmentName} ({app.doctorSpecialization})</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.appointmentTime}</div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {app.reasonForVisit || 'General checkup'}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        {app.status === 'PENDING' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--primary)', borderColor: '#bae6fd' }}
                            onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                            title="Confirm Appointment"
                          >
                            <Check size={14} /> Confirm
                          </button>
                        )}
                        {(app.status === 'CONFIRMED' || app.status === 'PENDING') && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--success)', borderColor: '#a7f3d0' }}
                            onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                            title="Mark as Completed"
                          >
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                            onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                            title="Cancel Appointment"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', alignSelf: 'center', color: 'var(--text-muted)' }}>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
