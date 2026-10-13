import React from 'react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
          {title || 'Hospital Management System'}
        </h2>
      </div>

      <div className="topbar-right">
        <NotificationBell />
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                {user.role}
              </div>
            </div>
            <div className="avatar-circle" style={{ background: '#0284c7' }}>
              {user.firstName ? user.firstName.charAt(0) : 'U'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
