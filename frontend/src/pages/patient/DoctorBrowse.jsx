import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Stethoscope, Award, Calendar, DollarSign } from 'lucide-react';
import { doctorService, departmentService } from '../../services/api';
import Alert from '../../components/Alert';

export default function DoctorBrowse() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    departmentService.getAll().then((res) => setDepartments(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery, selectedDept]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getAll({
        query: searchQuery || undefined,
        departmentId: selectedDept || undefined,
        size: 50,
      });
      setDoctors(res.data.content || []);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load physicians.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (doctorId) => {
    navigate(`/patient/book?doctorId=${doctorId}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Find Medical Specialists</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Browse board-certified doctors, clinical departments, and consultation fees
          </p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by physician name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="input-browse-doctor"
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>

          <div style={{ width: '220px' }}>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              id="select-browse-dept"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Searching hospital physician registry...</div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No physicians matched your search criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {doctors.map((doc) => (
            <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="avatar-circle" style={{ background: '#0284c7', width: '48px', height: '48px', fontSize: '1.2rem' }}>
                      {doc.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                        Dr. {doc.firstName} {doc.lastName}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {doc.specialization}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${doc.available ? 'badge-completed' : 'badge-cancelled'}`}>
                    {doc.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                    <strong>{doc.departmentName || 'General'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
                    <strong>{doc.experienceYears} Years</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Qualifications:</span>
                    <strong>{doc.qualification || 'MD'}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {doc.bio || 'Dedicated medical professional committed to excellence in patient healthcare.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Consultation Fee</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${Number(doc.consultationFee).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!doc.available}
                  onClick={() => handleBook(doc.id)}
                  id={`btn-book-doc-${doc.id}`}
                >
                  <Calendar size={16} /> Book Consult
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
