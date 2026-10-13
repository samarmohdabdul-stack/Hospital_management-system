import React, { useEffect, useState } from 'react';
import { FileText, Calendar, Stethoscope, HeartPulse } from 'lucide-react';
import { medicalRecordService, patientService } from '../../services/api';
import Alert from '../../components/Alert';

export default function MyMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    patientService.getMe().then((res) => {
      loadRecords(res.data.id);
    }).catch(console.error);
  }, []);

  const loadRecords = async (patientId) => {
    try {
      setLoading(true);
      const res = await medicalRecordService.getPatientRecords(patientId);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load medical history.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>My Clinical Health Records</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
          Consultation records, diagnoses, physical exam findings, and treatment plans from your physicians
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving your medical history...</div>
      ) : records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
          <h3>No Consultation Records Found</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
            When your physician records notes during or after an appointment, they will be organized here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {records.map((rec) => (
            <div key={rec.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon icon-blue" style={{ width: '42px', height: '42px' }}>
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                      Consultation with Dr. {rec.doctorName}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Specialty: {rec.doctorSpecialization}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consultation Date</div>
                  <strong style={{ color: 'var(--text-main)' }}>{rec.consultationDate}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Reported Symptoms
                  </span>
                  <div style={{ fontSize: '0.9rem' }}>{rec.symptoms || 'None recorded'}</div>
                </div>

                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    Clinical Diagnosis
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{rec.diagnosis}</div>
                </div>
              </div>

              {rec.clinicalNotes && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Doctor's Observations & Notes:
                  </span>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {rec.clinicalNotes}
                  </p>
                </div>
              )}

              {rec.treatmentPlan && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Recommended Treatment Plan:
                  </span>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {rec.treatmentPlan}
                  </p>
                </div>
              )}

              {rec.followUpDate && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.85rem', color: 'var(--secondary-hover)' }}>
                  <strong>Next Recommended Review: </strong> {rec.followUpDate}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
