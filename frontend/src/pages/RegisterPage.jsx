import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cross, ArrowRight, User, Mail, Lock, Phone, Calendar, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ ...formData, role: 'PATIENT' });
      navigate('/patient/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '2.5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.6rem', textDecoration: 'none' }}>
            <Cross size={32} /> CarePoint HMS
          </Link>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1rem', color: 'var(--text-main)' }}>Patient Registration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create your electronic patient profile to manage appointments, prescriptions, and health records
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} id="register-form">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Personal & Account Information
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  placeholder="e.g. Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  id="reg-first-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  id="reg-last-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  id="reg-email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password * (min 6 chars)</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  id="reg-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  id="reg-phone"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  id="reg-dob"
                />
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Medical & Emergency Profile
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-control" value={formData.gender} onChange={handleChange} id="reg-gender">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select name="bloodGroup" className="form-control" value={formData.bloodGroup} onChange={handleChange} id="reg-blood">
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="form-control"
                  placeholder="Spouse / Parent / Next of Kin"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  id="reg-emergency-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  id="reg-emergency-phone"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Street address, City, State, ZIP"
                value={formData.address}
                onChange={handleChange}
                id="reg-address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Known Allergies / Medical Alerts</label>
              <textarea
                name="allergies"
                className="form-control"
                rows="2"
                placeholder="e.g. Penicillin, Latex, Aspirin, or None known"
                value={formData.allergies}
                onChange={handleChange}
                id="reg-allergies"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
              disabled={loading}
              id="btn-register-submit"
            >
              {loading ? 'Creating Profile...' : 'Complete Patient Registration'} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
