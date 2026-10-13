import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Check, X, ShieldAlert, Stethoscope } from 'lucide-react';
import { doctorService, departmentService } from '../../services/api';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    departmentId: '',
    specialization: '',
    qualification: '',
    experienceYears: 0,
    consultationFee: 50.00,
    bio: '',
    available: true,
  });

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery, selectedDept, currentPage]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 8,
        query: searchQuery || undefined,
        departmentId: selectedDept || undefined,
      };
      const res = await doctorService.getAll(params);
      setDoctors(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load doctors' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDoctor(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      departmentId: departments[0]?.id || '',
      specialization: '',
      qualification: '',
      experienceYears: 0,
      consultationFee: 50.00,
      bio: '',
      available: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      email: doc.email,
      password: '',
      firstName: doc.firstName,
      lastName: doc.lastName,
      phone: doc.phone || '',
      departmentId: doc.departmentId || '',
      specialization: doc.specialization,
      qualification: doc.qualification || '',
      experienceYears: doc.experienceYears,
      consultationFee: doc.consultationFee,
      bio: doc.bio || '',
      available: doc.available,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await doctorService.update(editingDoctor.id, formData);
        setAlert({ type: 'success', message: 'Doctor details updated successfully.' });
      } else {
        await doctorService.create(formData);
        setAlert({ type: 'success', message: 'New doctor credentialed and created successfully.' });
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Check all required fields.';
      setAlert({ type: 'error', message: msg });
    }
  };

  const handleToggleAvailability = async (doc) => {
    try {
      await doctorService.updateAvailability(doc.id, !doc.available);
      setAlert({ type: 'success', message: `Availability status updated for Dr. ${doc.lastName}.` });
      fetchDoctors();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update availability.' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Doctor Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Credential, assign departments, and maintain physician profiles
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreateModal} id="btn-add-doctor">
          <Plus size={16} /> Add New Doctor
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by doctor name or specialization..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
              id="input-search-doctor"
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>

          <div style={{ width: '220px' }}>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(0); }}
              id="select-dept-filter"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading doctors...</td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No doctors matching the current criteria.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>Dr. {doc.firstName} {doc.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.email}</div>
                    </td>
                    <td>{doc.departmentName || 'Unassigned'}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{doc.specialization}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.qualification}</div>
                    </td>
                    <td>{doc.experienceYears} yrs</td>
                    <td style={{ fontWeight: 600 }}>${Number(doc.consultationFee).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(doc)}
                        className={`badge ${doc.available ? 'badge-completed' : 'badge-cancelled'}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        title="Click to toggle availability"
                      >
                        {doc.available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(doc)}
                        title="Edit Doctor"
                      >
                        <Edit2 size={14} /> Edit
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

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDoctor ? `Edit Dr. ${editingDoctor.firstName} ${editingDoctor.lastName}` : 'Add New Doctor Profile'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit}>
          {!editingDoctor && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Defaults to Doctor@123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-control"
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Cardiothoracic Surgery"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Qualifications</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MD, FACC, PhD"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Fee ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="form-control"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physician Biography</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Clinical focus, background, and research interests"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-doctor">
              {editingDoctor ? 'Save Changes' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
