import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <ShieldAlert size={64} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>403 Access Denied</h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0 1rem' }}>Restricted Healthcare Resource</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '440px', marginBottom: '2rem' }}>
        You do not possess the required medical or administrative credentials to access this system module.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Home
      </Link>
    </div>
  );
}
