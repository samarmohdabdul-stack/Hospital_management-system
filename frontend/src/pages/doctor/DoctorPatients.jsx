import React, { useEffect, useState } from 'react';
import { Search, Eye, FileText, Plus, Calendar, Clock } from 'lucide-react';
import { patientService, medicalRecordService, doctorService } from '../../services/api';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState(null);

  // Patient Records View Modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);

  // New Record Modal
  const [newRecordModalOpen, setNewRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    symptoms: '',
    diagnosis: '',
    clinicalNotes: '',
    treatmentPlan: '',
    followUpDate: '',
  });

  useEffect(() => {
    doctorService.getMe().then((res) => setDoctorProfile(res.data)).catch(console.error);
    fetchPatients();
  }, [searchQuery]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAll({ query: searchQuery || undefined, size: 20 });
      setPatients(res.data.content || []);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load patient records.' });
    } finally {
      setLoading(false);
    }
  };

  const openRecordsModal = async (patient) => {
    try {
      setSelectedPatient(patient);
      const res = await medicalRecordService.getPatientRecords(patient.id);
      setMedicalRecords(res.data);
      setRecordsModalOpen(true);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load patient medical history.' });
    }
  };

  const openNewRecordModal = (patient) => {
    setSelectedPatient(patient);
    setRecordForm({
      symptoms: '',
      diagnosis: '',
      clinicalNotes: '',
      treatmentPlan: '',
      followUpDate: '',
    });
    setNewRecordModalOpen(true);
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordService.create({
        patientId: selectedPatient.id,
        consultationDate: new Date().toISOString().split('T')[0],
        ...recordForm,
      });
      setAlert({ type: 'success', message: `Medical record saved for ${selectedPatient.firstName} ${selectedPatient.lastName}.` });
      setNewRecordModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save clinical record.';
      setAlert({ type: 'error', message: msg });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Clinical Patient Records</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Review medical history, past diagnoses, and record consultation notes
          </p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search patient by name, telephone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Gender / Blood</th>
                <th>Known Allergies</th>
                <th>Emergency Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading patient records...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{p.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
                    </td>
                    <td>{p.gender || 'N/A'} ({p.bloodGroup || 'N/A'})</td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ fontSize: '0.85rem', color: p.allergies ? '#b91c1c' : 'var(--text-muted)' }}>
                        {p.allergies || 'None known'}
                      </span>
                    </td>
                    <td>
                      <div>{p.emergencyContactName || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.emergencyContactPhone || ''}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openNewRecordModal(p)}
                          title="Record Clinical Findings"
                        >
                          <Plus size={14} /> Add Record
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openRecordsModal(p)}
                          title="View Consultation History"
                        >
                          <Eye size={14} /> History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Medical History Modal */}
      <Modal
        isOpen={recordsModalOpen}
        onClose={() => setRecordsModalOpen(false)}
        title={selectedPatient ? `Medical History: ${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Medical History'}
        maxWidth="750px"
      >
        <div>
          {medicalRecords.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              No previous clinical consultations on file for this patient.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {medicalRecords.map((rec) => (
                <div key={rec.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Dr. {rec.doctorName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({rec.doctorSpecialization})</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Date: {rec.consultationDate}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                    {rec.symptoms && (
                      <div>
                        <strong>Symptoms: </strong> {rec.symptoms}
                      </div>
                    )}
                    <div>
                      <strong style={{ color: 'var(--primary-dark)' }}>Diagnosis: </strong> {rec.diagnosis}
                    </div>
                    {rec.clinicalNotes && (
                      <div style={{ background: 'var(--bg-muted)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Clinical Notes: </strong> {rec.clinicalNotes}
                      </div>
                    )}
                    {rec.treatmentPlan && (
                      <div>
                        <strong>Treatment Plan: </strong> {rec.treatmentPlan}
                      </div>
                    )}
                    {rec.followUpDate && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>
                        <strong>Recommended Follow-up: </strong> {rec.followUpDate}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-primary" onClick={() => setRecordsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* New Consultation Record Modal */}
      <Modal
        isOpen={newRecordModalOpen}
        onClose={() => setNewRecordModalOpen(false)}
        title={selectedPatient ? `New Clinical Record: ${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Add Medical Record'}
        maxWidth="680px"
      >
        <form onSubmit={handleRecordSubmit}>
          <div className="form-group">
            <label className="form-label">Symptoms & Patient Complaints</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="e.g. Recurrent chest pressure, shortness of breath on exertion"
              value={recordForm.symptoms}
              onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Diagnosis *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Mild Angina Pectoris, Type 2 Diabetes Mellitus"
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Observations & Findings</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Blood pressure 135/85 mmHg, Heart rate 72 bpm, Normal S1/S2"
              value={recordForm.clinicalNotes}
              onChange={(e) => setRecordForm({ ...recordForm, clinicalNotes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Treatment Plan</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Therapy recommendations, diagnostics requested, lifestyle adjustments"
              value={recordForm.treatmentPlan}
              onChange={(e) => setRecordForm({ ...recordForm, treatmentPlan: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Follow-up Date</label>
            <input
              type="date"
              className="form-control"
              value={recordForm.followUpDate}
              onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setNewRecordModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-record">
              Save Medical Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
