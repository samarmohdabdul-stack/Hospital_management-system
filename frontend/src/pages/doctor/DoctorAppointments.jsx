import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle, XCircle, FileText, Pill } from 'lucide-react';
import { appointmentService, doctorService, medicalRecordService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [alert, setAlert] = useState(null);

  // Clinical Record Modal
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [recordForm, setRecordForm] = useState({
    symptoms: '',
    diagnosis: '',
    clinicalNotes: '',
    treatmentPlan: '',
    followUpDate: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    doctorService.getMe().then((res) => {
      setDoctorProfile(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (doctorProfile) {
      fetchAppointments();
    }
  }, [doctorProfile, statusFilter, dateFilter, currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAll({
        doctorId: doctorProfile.id,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        page: currentPage,
        size: 8,
      });
      setAppointments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load appointments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      setAlert({ type: 'success', message: `Appointment status updated to ${status}.` });
      fetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      setAlert({ type: 'error', message: msg });
    }
  };

  const openClinicalRecordModal = (app) => {
    setActiveAppointment(app);
    setRecordForm({
      symptoms: app.reasonForVisit || '',
      diagnosis: '',
      clinicalNotes: '',
      treatmentPlan: '',
      followUpDate: '',
    });
    setRecordModalOpen(true);
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordService.create({
        patientId: activeAppointment.patientId,
        appointmentId: activeAppointment.id,
        consultationDate: activeAppointment.appointmentDate,
        ...recordForm,
      });
      // Optionally also mark appointment as completed if not already
      if (activeAppointment.status !== 'COMPLETED') {
        await appointmentService.updateStatus(activeAppointment.id, 'COMPLETED');
      }
      setAlert({ type: 'success', message: 'Clinical consultation record saved successfully!' });
      setRecordModalOpen(false);
      fetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save clinical record.';
      setAlert({ type: 'error', message: msg });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>My Clinical Appointments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Manage scheduled patient consultations, record clinical findings, and issue prescriptions
          </p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: '220px' }}>
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Appointments</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ width: '220px' }}>
            <label className="form-label">Filter Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(0); }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Appt #</th>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Chief Complaint</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Clinical Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading appointment schedule...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No appointments found matching filter.
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
                      <div style={{ fontWeight: 600 }}>{app.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.appointmentTime}</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{app.reasonForVisit || 'General Consultation'}</div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {app.status === 'PENDING' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--primary)' }}
                            onClick={() => handleStatusChange(app.id, 'CONFIRMED')}
                            title="Accept and Confirm"
                          >
                            <Check size={14} /> Accept
                          </button>
                        )}
                        {app.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openClinicalRecordModal(app)}
                            title="Add Consultation Record"
                          >
                            <FileText size={14} /> Record Diagnosis
                          </button>
                        )}
                        {app.status === 'COMPLETED' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => openClinicalRecordModal(app)}
                            title="Update Consultation Record"
                          >
                            <FileText size={14} /> Notes
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/doctor/prescriptions?patientId=${app.patientId}&appointmentId=${app.id}`)}
                          title="Issue Prescription"
                        >
                          <Pill size={14} /> Rx
                        </button>
                        {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                            onClick={() => handleStatusChange(app.id, 'CANCELLED')}
                            title="Cancel"
                          >
                            <XCircle size={14} />
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

      {/* Record Clinical Consultation Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title={activeAppointment ? `Consultation Record: ${activeAppointment.patientName}` : 'Record Clinical Consultation'}
        maxWidth="680px"
      >
        {activeAppointment && (
          <form onSubmit={handleRecordSubmit}>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <strong>Appointment:</strong> #{activeAppointment.id} on {activeAppointment.appointmentDate} at {activeAppointment.appointmentTime}
            </div>

            <div className="form-group">
              <label className="form-label">Reported Symptoms</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Patient described symptoms, duration, intensity..."
                value={recordForm.symptoms}
                onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Diagnosis *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Essential Hypertension (ICD-10 I10), Acute Bronchitis"
                value={recordForm.diagnosis}
                onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physician Clinical Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Vital signs, physical exam findings, auscultation results..."
                value={recordForm.clinicalNotes}
                onChange={(e) => setRecordForm({ ...recordForm, clinicalNotes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Plan & Dietary Recommendations</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Prescribed rest, hydration, salt reduction, lifestyle modifications..."
                value={recordForm.treatmentPlan}
                onChange={(e) => setRecordForm({ ...recordForm, treatmentPlan: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recommended Follow-up Date</label>
              <input
                type="date"
                className="form-control"
                value={recordForm.followUpDate}
                onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setRecordModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" id="btn-save-clinical-record">
                Save Clinical Record & Complete
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
