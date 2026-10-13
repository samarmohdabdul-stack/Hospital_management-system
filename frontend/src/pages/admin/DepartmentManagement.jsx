import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Users } from 'lucide-react';
import { departmentService } from '../../services/api';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [doctorsModalOpen, setDoctorsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDeptDoctors, setSelectedDeptDoctors] = useState([]);
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headDoctorName: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load departments.' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', headDoctorName: '' });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      headDoctorName: dept.headDoctorName || '',
    });
    setModalOpen(true);
  };

  const openDoctorsModal = async (dept) => {
    try {
      setSelectedDeptName(dept.name);
      const res = await departmentService.getDoctors(dept.id);
      setSelectedDeptDoctors(res.data);
      setDoctorsModalOpen(true);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load department doctors.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, formData);
        setAlert({ type: 'success', message: 'Department updated successfully.' });
      } else {
        await departmentService.create(formData);
        setAlert({ type: 'success', message: 'New department established.' });
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save department.';
      setAlert({ type: 'error', message: msg });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await departmentService.delete(id);
      setAlert({ type: 'success', message: `Department "${name}" deleted.` });
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete department with active assigned doctors.';
      setAlert({ type: 'error', message: msg });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Department Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Configure clinical branches, heads of department, and physician allocations
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreateModal} id="btn-add-department">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Head of Department</th>
                <th>Assigned Doctors</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading departments...</td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No departments created yet.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <Building2 size={18} style={{ color: 'var(--primary)' }} />
                        {dept.name}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {dept.description || 'No description entered'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{dept.headDoctorName || 'Pending Appointment'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openDoctorsModal(dept)}
                      >
                        <Users size={14} /> {dept.doctorCount} Doctors
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openEditModal(dept)}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                          onClick={() => handleDelete(dept.id, dept.name)}
                        >
                          <Trash2 size={14} />
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

      {/* Create / Edit Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Oncology, Neurology, Orthopedics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Head of Department / Chief Physician</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Robert Smith"
              value={formData.headDoctorName}
              onChange={(e) => setFormData({ ...formData, headDoctorName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Scope & Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Overview of diagnosis, treatments, and procedures provided"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-department">
              {editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Doctors in Department Modal */}
      <Modal
        isOpen={doctorsModalOpen}
        onClose={() => setDoctorsModalOpen(false)}
        title={`Physicians in ${selectedDeptName}`}
      >
        <div>
          {selectedDeptDoctors.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
              No doctors currently assigned to this department.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedDeptDoctors.map((doc) => (
                <div key={doc.id} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>Dr. {doc.firstName} {doc.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.specialization} ({doc.qualification})</div>
                  </div>
                  <span className={`badge ${doc.available ? 'badge-completed' : 'badge-cancelled'}`}>
                    {doc.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-primary" onClick={() => setDoctorsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
