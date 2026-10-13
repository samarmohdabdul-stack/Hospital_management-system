import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components & Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManagement from './pages/admin/DoctorManagement';
import PatientManagement from './pages/admin/PatientManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import BillingManagement from './pages/admin/BillingManagement';
import AuditLogs from './pages/admin/AuditLogs';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import PrescriptionCreate from './pages/doctor/PrescriptionCreate';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorBrowse from './pages/patient/DoctorBrowse';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyMedicalRecords from './pages/patient/MyMedicalRecords';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import MyInvoices from './pages/patient/MyInvoices';

// Common Pages
import ProfilePage from './pages/common/ProfilePage';
import NotFoundPage from './pages/common/NotFoundPage';
import AccessDeniedPage from './pages/common/AccessDeniedPage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Layout title="Hospital Administration" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<DoctorManagement />} />
              <Route path="patients" element={<PatientManagement />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="appointments" element={<AppointmentManagement />} />
              <Route path="billing" element={<BillingManagement />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Doctor Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <Layout title="Physician Workspace" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="prescriptions" element={<PrescriptionCreate />} />
            </Route>

            {/* Patient Routes */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <Layout title="Patient Portal" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="doctors" element={<DoctorBrowse />} />
              <Route path="book" element={<BookAppointment />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="records" element={<MyMedicalRecords />} />
              <Route path="prescriptions" element={<MyPrescriptions />} />
              <Route path="invoices" element={<MyInvoices />} />
            </Route>

            {/* Common Authenticated Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout title="Account Settings" />
                </ProtectedRoute>
              }
            >
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
