import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  History,
  Pill,
  LogOut,
  Cross,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Cross size={24} style={{ color: '#38bdf8' }} />
          <span>CarePoint</span> HMS
        </div>
      </div>

      <div style={{ padding: '0.75rem 1.25rem 0' }}>
        <div className="sidebar-role-badge">
          Role: {role}
        </div>
      </div>

      <nav className="sidebar-nav">
        {role === 'ADMIN' && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-dashboard">
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-doctors">
              <UserCheck size={18} /> Doctors
            </NavLink>
            <NavLink to="/admin/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-patients">
              <Users size={18} /> Patients
            </NavLink>
            <NavLink to="/admin/departments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-departments">
              <Building2 size={18} /> Departments
            </NavLink>
            <NavLink to="/admin/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-appointments">
              <Calendar size={18} /> Appointments
            </NavLink>
            <NavLink to="/admin/billing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-billing">
              <CreditCard size={18} /> Billing & Invoices
            </NavLink>
            <NavLink to="/admin/audit-logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-admin-audit">
              <History size={18} /> Audit Logs
            </NavLink>
          </>
        )}

        {role === 'DOCTOR' && (
          <>
            <NavLink to="/doctor/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-doctor-dashboard">
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/doctor/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-doctor-appointments">
              <Calendar size={18} /> My Appointments
            </NavLink>
            <NavLink to="/doctor/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-doctor-patients">
              <Users size={18} /> Patient Records
            </NavLink>
            <NavLink to="/doctor/prescriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-doctor-prescriptions">
              <Pill size={18} /> Prescriptions
            </NavLink>
          </>
        )}

        {role === 'PATIENT' && (
          <>
            <NavLink to="/patient/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-patient-dashboard">
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/patient/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-patient-doctors">
              <UserCheck size={18} /> Find Doctors
            </NavLink>
            <NavLink to="/patient/book" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-patient-book">
              <Calendar size={18} /> Book Appointment
            </NavLink>
            <NavLink to="/patient/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-patient-appointments">
              <History size={18} /> My Appointments
            </NavLink>
            <NavLink to="/patient/records" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-patient-records">
              <FileText size={18} /> Medical Records
            </NavLink>
            <NavLink to="/patient/prescriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-patient-prescriptions">
              <Pill size={18} /> My Prescriptions
            </NavLink>
            <NavLink to="/patient/invoices" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-patient-invoices">
              <CreditCard size={18} /> Bills & Invoices
            </NavLink>
          </>
        )}

        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-profile">
          <User size={18} /> My Profile
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card" style={{ marginBottom: '0.75rem' }}>
          <div className="avatar-circle">
            {user.firstName ? user.firstName.charAt(0) : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.email}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleLogout}
          style={{ width: '100%', color: '#ef4444', borderColor: '#334155' }}
          id="btn-logout"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
