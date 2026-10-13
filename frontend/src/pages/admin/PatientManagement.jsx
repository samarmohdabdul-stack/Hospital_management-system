import React, { useEffect, useState } from 'react';
import { Search, Eye, Edit2, HeartPulse, User } from 'lucide-react';
import { patientService } from '../../services/api';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [searchQuery, currentPage]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAll({
        page: currentPage,
        size: 8,
        query: searchQuery || undefined,
      });
      setPatients(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load patients' });
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (p) => {
    setSelectedPatient(p);
    setViewModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Patient Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Search registered patients and view demographic & emergency profiles
          </p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search Input */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search patient by name, email, or telephone number..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
            id="input-search-patient"
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {/* Patients Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Full Name</th>
                <th>Email & Phone</th>
                <th>Gender / Blood</th>
                <th>Date of Birth</th>
                <th>Emergency Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading patient directory...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--primary)' }}>#{p.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                    <td>
                      <div>{p.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <span className="badge badge-confirmed" style={{ marginRight: '0.35rem' }}>{p.gender || 'N/A'}</span>
                      <span className="badge badge-completed">{p.bloodGroup || 'N/A'}</span>
                    </td>
                    <td>{p.dateOfBirth || 'Not recorded'}</td>
                    <td>
                      <div>{p.emergencyContactName || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.emergencyContactPhone || ''}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openViewModal(p)}
                      >
                        <Eye size={14} /> View Details
                      </button>
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

      {/* Patient Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedPatient ? `Patient Record: ${selectedPatient.firstName} ${selectedPatient.lastName}` : ''}
        maxWidth="600px"
      >
        {selectedPatient && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PATIENT ID</label>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>#{selectedPatient.id}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>EMAIL</label>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{selectedPatient.email}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PHONE</label>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{selectedPatient.phone || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DATE OF BIRTH</label>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{selectedPatient.dateOfBirth || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>GENDER / BLOOD GROUP</label>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{selectedPatient.gender} | {selectedPatient.bloodGroup}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>EMERGENCY CONTACT</label>
                <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>
                  {selectedPatient.emergencyContactName || 'N/A'} ({selectedPatient.emergencyContactPhone || 'N/A'})
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>RESIDENTIAL ADDRESS</label>
              <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{selectedPatient.address || 'No address provided'}</p>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 700, fontSize: '0.85rem' }}>
                <HeartPulse size={16} /> ALLERGIES & CLINICAL ALERTS
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#7f1d1d' }}>
                {selectedPatient.allergies || 'No documented allergies.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={() => setViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
