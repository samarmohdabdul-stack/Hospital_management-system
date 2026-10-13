import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <AlertTriangle size={64} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0 1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '2rem' }}>
        The clinical resource or hospital portal page you requested does not exist or has been relocated.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Return to Homepage
      </Link>
    </div>
  );
}
