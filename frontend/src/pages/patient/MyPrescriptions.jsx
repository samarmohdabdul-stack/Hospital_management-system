import React, { useEffect, useState } from 'react';
import { Pill, Calendar, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';
import { prescriptionService, patientService } from '../../services/api';
import Alert from '../../components/Alert';

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    patientService.getMe().then((res) => {
      loadPrescriptions(res.data.id);
    }).catch(console.error);
  }, []);

  const loadPrescriptions = async (patientId) => {
    try {
      setLoading(true);
      const res = await prescriptionService.getPatientPrescriptions(patientId);
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: 'error', message: 'Failed to load prescriptions.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>My Digital Prescriptions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
          Official electronic medication orders issued by your attending physicians
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Retrieving your prescription history...</div>
      ) : prescriptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
          <Pill size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
          <h3>No Prescriptions Found</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
            When a doctor writes an electronic prescription during your appointment, it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {prescriptions.map((rx) => (
            <div key={rx.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon icon-teal" style={{ width: '42px', height: '42px' }}>
                    <Pill size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                      Prescription from Dr. {rx.doctorName}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Specialty: {rx.doctorSpecialization}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Issue Date</span>
                  <strong style={{ color: 'var(--text-main)' }}>{rx.issueDate}</strong>
                </div>
              </div>

              {/* Medication Items Table */}
              <div className="table-responsive" style={{ marginBottom: '1rem' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Special Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.items?.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.medicationName}</td>
                        <td style={{ fontWeight: 600 }}>{item.dosage}</td>
                        <td>{item.frequency}</td>
                        <td>{item.duration}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {item.instructions || 'Follow standard package instructions'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rx.notes && (
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <strong>Physician Advice: </strong> {rx.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
