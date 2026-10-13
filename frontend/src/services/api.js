import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration & errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const doctorService = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getMe: () => api.get('/doctors/me'),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  updateAvailability: (id, available) => api.patch(`/doctors/${id}/availability`, null, { params: { available } }),
  updateStatus: (id, active) => api.patch(`/doctors/${id}/status`, null, { params: { active } }),
};

export const patientService = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getMe: () => api.get('/patients/me'),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getDoctors: (id) => api.get(`/departments/${id}/doctors`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const appointmentService = {
  book: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, null, { params: { status } }),
  cancel: (id) => api.post(`/appointments/${id}/cancel`),
  getBookedSlots: (doctorId, date) => api.get('/appointments/booked-slots', { params: { doctorId, date } }),
};

export const medicalRecordService = {
  create: (data) => api.post('/medical-records', data),
  getPatientRecords: (patientId) => api.get(`/patients/${patientId}/medical-records`),
  getById: (id) => api.get(`/medical-records/${id}`),
};

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getPatientPrescriptions: (patientId) => api.get(`/patients/${patientId}/prescriptions`),
  getById: (id) => api.get(`/prescriptions/${id}`),
};

export const billingService = {
  createInvoice: (data) => api.post('/invoices', data),
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  recordPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
};

export const dashboardService = {
  getAdminStats: () => api.get('/admin/dashboard'),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/mark-all-read'),
};

export const auditLogService = {
  getAll: (params) => api.get('/admin/audit-logs', { params }),
};

export default api;
