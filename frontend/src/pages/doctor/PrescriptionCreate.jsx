import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pill, CheckCircle, FileText } from 'lucide-react';
import { prescriptionService, patientService, doctorService } from '../../services/api';
import Alert from '../../components/Alert';

export default function PrescriptionCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialPatientId = searchParams.get('patientId') || '';
  const initialAppointmentId = searchParams.get('appointmentId') || '';

  const [patients, setPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    patientId: initialPatientId,
    appointmentId: initialAppointmentId,
    issueDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [
      {
        medicationName: '',
        dosage: '500mg',
        frequency: 'Twice daily after meals',
        duration: '7 days',
        instructions: 'Take with plenty of water',
      },
    ],
  });

  useEffect(() => {
    Promise.all([
      patientService.getAll({ size: 100 }),
      doctorService.getMe(),
    ])
      .then(([patRes, docRes]) => {
        setPatients(patRes.data.content || []);
        setDoctorProfile(docRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          medicationName: '',
          dosage: '',
          frequency: 'Once daily',
          duration: '5 days',
          instructions: '',
        },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      setAlert({ type: 'error', message: 'Please select a patient.' });
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].medicationName) {
      setAlert({ type: 'error', message: 'Please specify at least one medication item.' });
      return;
    }

    try {
      await prescriptionService.create({
        patientId: formData.patientId,
        appointmentId: formData.appointmentId || undefined,
        issueDate: formData.issueDate,
        notes: formData.notes,
        items: formData.items,
      });

      setAlert({ type: 'success', message: 'Prescription officially issued and delivered to patient portal!' });
      // Reset
      setFormData({
        patientId: '',
        appointmentId: '',
        issueDate: new Date().toISOString().split('T')[0],
        notes: '',
        items: [
          {
            medicationName: '',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '7 days',
            instructions: '',
          },
        ],
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to issue prescription.';
      setAlert({ type: 'error', message: msg });
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading prescription generator...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Electronic Prescription Writer</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Authorized prescribing: Dr. {doctorProfile?.firstName} {doctorProfile?.lastName} ({doctorProfile?.specialization})
          </p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card" style={{ maxWidth: '900px' }}>
        <form onSubmit={handleSubmit} id="prescription-form">
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Select Patient *</label>
              <select
                className="form-control"
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                id="select-rx-patient"
              >
                <option value="">Choose Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (#{p.id} - {p.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                id="rx-issue-date"
              />
            </div>
          </div>

          <div style={{ margin: '1.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={18} style={{ color: 'var(--primary)' }} /> Prescribed Medications & Dosages
              </h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleAddItem} id="btn-add-rx-row">
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            {formData.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-muted)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                    Item #{idx + 1}
                  </span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                      onClick={() => handleRemoveItem(idx)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Medication Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Amoxicillin, Atorvastatin, Metformin"
                      value={item.medicationName}
                      onChange={(e) => handleItemChange(idx, 'medicationName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dosage *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. 500mg, 10ml, 1 tablet"
                      value={item.dosage}
                      onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Frequency *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Twice daily, Every 8 hours"
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. 7 days, 1 month"
                      value={item.duration}
                      onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Specific Patient Instructions</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Take 30 minutes before breakfast with full glass of water"
                    value={item.instructions}
                    onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">General Prescribing Notes & Advice</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Advice on drug interactions, hydration, warning signs to watch for..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/doctor/appointments')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-issue-prescription"
            >
              Issue Digital Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
