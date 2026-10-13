import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, User, AlertCircle, ArrowRight } from 'lucide-react';
import { doctorService, appointmentService } from '../../services/api';
import Alert from '../../components/Alert';

export default function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  // Available consultation timeslots during clinic working hours (08:00 - 17:00)
  const availableSlots = [
    '08:00:00', '08:30:00',
    '09:00:00', '09:30:00',
    '10:00:00', '10:30:00',
    '11:00:00', '11:30:00',
    '13:00:00', '13:30:00',
    '14:00:00', '14:30:00',
    '15:00:00', '15:30:00',
    '16:00:00', '16:30:00',
  ];

  useEffect(() => {
    doctorService.getAll({ size: 100 })
      .then((res) => {
        const availableDocs = (res.data.content || []).filter((d) => d.available);
        setDoctors(availableDocs);
        if (!selectedDoctorId && availableDocs.length > 0) {
          setSelectedDoctorId(availableDocs[0].id.toString());
        }
      })
      .catch(console.error);
  }, []);

  // Fetch booked slots whenever doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && appointmentDate) {
      fetchBookedSlots(selectedDoctorId, appointmentDate);
    }
  }, [selectedDoctorId, appointmentDate]);

  const fetchBookedSlots = async (docId, date) => {
    try {
      setLoadingSlots(true);
      const res = await appointmentService.getBookedSlots(docId, date);
      setBookedSlots(res.data || []);
      setSelectedTime(''); // reset selection
    } catch (err) {
      console.error('Failed to load doctor slots', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !appointmentDate || !selectedTime) {
      setAlert({ type: 'error', message: 'Please select a physician, date, and available time slot.' });
      return;
    }

    try {
      setSubmitting(true);
      setAlert(null);
      const res = await appointmentService.book({
        doctorId: parseInt(selectedDoctorId),
        appointmentDate,
        appointmentTime: selectedTime,
        reasonForVisit,
      });

      setConfirmation(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Appointment booking failed. Slot may have been taken.';
      setAlert({ type: 'error', message: msg });
      // Refresh slots on collision
      fetchBookedSlots(selectedDoctorId, appointmentDate);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id.toString() === selectedDoctorId.toString());

  if (confirmation) {
    return (
      <div style={{ maxWidth: '640px', margin: '2rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', background: '#d1fae5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Appointment Booked Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Your consultation request has been submitted and is currently PENDING confirmation by clinical staff.
          </p>

          <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: '1.5rem', margin: '2rem 0', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Appointment ID:</span>
              <strong>#{confirmation.id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Consulting Physician:</span>
              <strong>{confirmation.doctorName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <strong>{confirmation.departmentName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
              <strong>{confirmation.appointmentDate} at {confirmation.appointmentTime}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Consultation Fee:</span>
              <strong style={{ color: 'var(--primary)' }}>${Number(confirmation.consultationFee).toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setConfirmation(null);
                setReasonForVisit('');
                setSelectedTime('');
              }}
            >
              Book Another Appointment
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/patient/appointments')}
            >
              View My Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Book Clinical Appointment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
          Real-time slot schedule validation with automatic double-booking collision prevention
        </p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form onSubmit={handleBooking} id="booking-form">
        {/* Step 1: Doctor Selection */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">1. Select Medical Specialist</div>
          </div>
          <div className="form-group">
            <select
              className="form-control"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
              id="select-booking-doctor"
            >
              <option value="">Select a Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.firstName} {doc.lastName} — {doc.departmentName} ({doc.specialization}) [${Number(doc.consultationFee).toFixed(2)}]
                </option>
              ))}
            </select>
          </div>

          {selectedDoctor && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedDoctor.departmentName} • {selectedDoctor.specialization} ({selectedDoctor.experienceYears} yrs experience)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Fee</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ${Number(selectedDoctor.consultationFee).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Date & Available Time Slots */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">2. Choose Consultation Date & Slot</div>
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Date</label>
            <input
              type="date"
              className="form-control"
              min={new Date().toISOString().split('T')[0]}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              id="input-booking-date"
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Available 30-Minute Time Slots</label>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', background: 'var(--primary-light)', borderRadius: '2px' }} /> Available
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '10px', height: '10px', background: '#e2e8f0', borderRadius: '2px' }} /> Booked
                </span>
              </div>
            </div>

            {loadingSlots ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>Checking doctor availability schedule...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
                {availableSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedTime === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected
                          ? 'var(--primary)'
                          : isBooked
                          ? '#f1f5f9'
                          : '#ffffff',
                        color: isSelected
                          ? '#ffffff'
                          : isBooked
                          ? '#94a3b8'
                          : 'var(--text-main)',
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'center',
                      }}
                    >
                      {slot.substring(0, 5)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Visit Reason */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">3. Reason for Visit</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Describe Symptoms or Purpose of Visit</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Mild chest discomfort, routine cardiac checkup, prescription renewal..."
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              id="input-booking-reason"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          disabled={submitting || !selectedTime}
          id="btn-confirm-booking"
        >
          {submitting ? 'Verifying & Booking...' : 'Confirm Appointment Booking'} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
