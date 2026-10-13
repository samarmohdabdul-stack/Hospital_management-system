import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, HeartPulse, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/api';
import Alert from '../../components/Alert';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
  });

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      patientService.getMe()
        .then((res) => {
          setProfile(res.data);
          setFormData({
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            phone: res.data.phone || '',
            address: res.data.address || '',
            emergencyContactName: res.data.emergencyContactName || '',
            emergencyContactPhone: res.data.emergencyContactPhone || '',
            allergies: res.data.allergies || '',
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role === 'PATIENT' && profile) {
      try {
        const res = await patientService.update(profile.id, formData);
        setProfile(res.data);
        setAlert({ type: 'success', message: 'Profile details saved successfully!' });
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to update profile.' });
      }
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>My Account & Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
          Registered role: {user?.role} • {user?.email}
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="avatar-circle" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {user?.email} • <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {user?.role === 'PATIENT' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

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
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Known Allergies / Medical Alerts</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Profile Changes
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="text" className="form-control" value={user?.email || ''} readOnly disabled />
              </div>
              <div className="form-group">
                <label className="form-label">User Role</label>
                <input type="text" className="form-control" value={user?.role || ''} readOnly disabled />
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Staff credential adjustments and departmental changes are managed through the System Administration console.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
