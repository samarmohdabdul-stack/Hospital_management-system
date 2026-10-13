import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cross, ShieldCheck, Clock, Users, Award, Calendar, ArrowRight, HeartPulse, Stethoscope, Activity } from 'lucide-react';
import { departmentService, doctorService } from '../services/api';

export default function LandingPage() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    departmentService.getAll()
      .then((res) => setDepartments(res.data.slice(0, 4)))
      .catch((err) => console.error(err));

    doctorService.getAll({ size: 3 })
      .then((res) => setDoctors(res.data.content || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: '#ffffff', zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.35rem', color: 'var(--primary)' }}>
            <Cross size={28} />
            <span style={{ color: 'var(--text-main)' }}>CarePoint <span style={{ color: 'var(--primary)' }}>Hospital</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-outline" id="landing-login-btn">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" id="landing-register-btn">
              Patient Registration
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <Activity size={16} /> Advanced Healthcare Management Platform
          </div>
          <h1 style={{ fontSize: '3.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Next-Generation Clinical Care & Hospital Administration
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#475569', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Empowering patients, physicians, and administrative specialists with unified appointment booking, real-time clinical notes, electronic prescriptions, and transparent billing.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
              Book an Appointment <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', background: '#ffffff' }}>
              Staff & Doctor Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Comprehensive Digital Health System
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Secure, HIPAA-inspired role-based architecture built for modern medical facilities
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ marginBottom: 0, padding: '2rem' }}>
            <div className="stat-icon icon-blue" style={{ marginBottom: '1.25rem' }}>
              <Calendar size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Smart Scheduling</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Real-time slot locking and collision prevention guarantees zero double-bookings across all outpatient departments.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0, padding: '2rem' }}>
            <div className="stat-icon icon-teal" style={{ marginBottom: '1.25rem' }}>
              <Stethoscope size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Clinical Records</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Encrypted patient histories, clinical observations, diagnoses, and digital prescriptions accessible only to authorized medical personnel.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0, padding: '2rem' }}>
            <div className="stat-icon icon-green" style={{ marginBottom: '1.25rem' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Itemized Billing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Precise monetary calculation with BigDecimal, automated tax and discount support, and instant printable patient invoices.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Departments */}
      {departments.length > 0 && (
        <section style={{ background: '#f8fafc', padding: '4.5rem 2rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Specialized Medical Departments</h2>
                <p style={{ color: 'var(--text-muted)' }}>Expert clinical care led by board-certified physicians</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {departments.map((dept) => (
                <div key={dept.id} className="card" style={{ marginBottom: 0, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    <HeartPulse size={20} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{dept.name}</h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {dept.description || 'Dedicated clinical specialty center.'}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    Chief: {dept.headDoctorName || 'Staff Physician'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '2.5rem 2rem', background: '#ffffff', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          © {new Date().getFullYear()} CarePoint Hospital Management System. Full Stack Java & React Production Architecture.
        </p>
      </footer>
    </div>
  );
}
