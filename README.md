# CarePoint Hospital Management System (HMS)

> A modern, production-grade, Full Stack Java & React enterprise web application for hospital administration, doctor scheduling, clinical consultation records, digital prescriptions, and itemized medical billing.

---

## 🌟 Key Highlights & Architecture

- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security 6 with stateless JWT Bearer authorization, Spring Data JPA, Hibernate, Bean Validation, and Flyway database migrations.
- **Frontend**: React 18 with Vite, React Router v6, Axios REST client with token interceptor, Recharts analytics, Lucide Icons, and modern responsive CSS design system.
- **Database**: MySQL 8.0 schema with foreign key constraints, indexes, and automated migrations. Includes H2 zero-configuration profile for instant local evaluation.
- **Security**: BCrypt password hashing, role-based access control (RBAC), fine-grained resource level authorization, CSRF protection, and audit logging.
- **Double-Booking Prevention**: Server-side transactional slot locking (`existsActiveAppointmentForDoctor`) and schedule collision prevention.
- **Itemized Billing**: Precise `BigDecimal` monetary calculation for consultation fees, laboratory line items, taxes, discounts, and payment tracking.
- **API Documentation**: OpenAPI 3.0 / Swagger UI documentation at `/swagger-ui.html`.

---

## 👥 Default Demo Credentials

For quick testing, the database is pre-seeded with sample users for each role:

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@hospital.com` | `password123` | Executive KPI dashboard, doctor/patient/department CRUD, all appointments, invoice creation, audit logs |
| **Doctor (Cardiology)** | `doctor1@hospital.com` | `password123` | Personal appointment schedule, patient records, diagnoses, electronic prescriptions |
| **Doctor (Neurology)** | `doctor2@hospital.com` | `password123` | Specialized neurology schedule and clinical consultations |
| **Patient** | `patient1@hospital.com` | `password123` | Book appointments with real-time slot checking, view medical history, digital prescriptions, pay invoices |

*Note: You can also register a brand new Patient directly through the web interface at `/register`.*

---

## 🏗️ Project Folder Structure

```
Hospital_Management_System/
├── backend/
│   ├── src/main/java/com/hospital/
│   │   ├── config/              # SecurityConfig, OpenApiConfig, DataInitializer
│   │   ├── controller/          # REST Controllers (/api/v1/*)
│   │   ├── dto/                 # Request & Response DTOs
│   │   ├── entity/              # JPA Entities & Enums
│   │   ├── exception/           # GlobalExceptionHandler & Custom Exceptions
│   │   ├── mapper/              # EntityDtoMapper
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   ├── security/            # JWT TokenProvider, UserPrincipal, Filters
│   │   └── service/             # Business Logic & Transactional Services
│   ├── src/main/resources/
│   │   ├── db/migration/        # Flyway V1 schema & V2 seeds
│   │   ├── application.yml      # Base Spring Boot Configuration
│   │   ├── application-mysql.yml# MySQL 8 datasource profile
│   │   └── application-h2.yml   # Embedded H2 in-memory profile
│   ├── src/test/java/           # JUnit 5 & Mockito test suites
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/          # Sidebar, Navbar, StatCard, Modal, StatusBadge, PrintModal
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── admin/           # Dashboard, Doctors, Patients, Departments, Appointments, Billing, Audit
│   │   │   ├── doctor/          # DoctorDashboard, DoctorAppointments, DoctorPatients, PrescriptionCreate
│   │   │   ├── patient/         # PatientDashboard, DoctorBrowse, BookAppointment, MyAppointments, Records, Invoices
│   │   │   └── common/          # LandingPage, LoginPage, RegisterPage, ProfilePage
│   │   ├── services/            # Axios API clients
│   │   ├── styles/              # Design system & CSS rules
│   │   ├── App.jsx              # Application router
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup & Execution Guide

### Prerequisites
- **JDK 21 or higher** (`java -version`)
- **Maven 3.8+** (`mvn -v`)
- **Node.js 18+ & npm 9+** (`node -v`, `npm -v`)
- **MySQL 8.0** or **Docker** (optional, embedded H2 mode works out of the box)

---

### Step 1: Start the Backend (Spring Boot)

#### Option A: Running with Embedded In-Memory Database (Fastest Start)
```powershell
# In Windows PowerShell:
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=h2"
```

#### Option B: Running with Local MySQL 8.0
1. Ensure MySQL service is running on port 3306.
2. In `backend/src/main/resources/application-mysql.yml` or via environment variables, supply your database password:
```powershell
$env:DB_PASSWORD="your_mysql_password"
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
```
Flyway will automatically execute migrations:
- `V1__init_schema.sql` (Creates all tables, constraints, and indexes)
- `V2__seed_data.sql` (Seeds departments, sample doctors, and patient profiles)

Backend is available at: **http://localhost:8080**
Swagger API Docs: **http://localhost:8080/swagger-ui.html**

---

### Step 2: Start the Frontend (React + Vite)

Open a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```

Frontend is available at: **http://localhost:5173**

---

### Step 3: Run with Docker Compose (Production Stack)

To run the entire system (MySQL 8 + Spring Boot + React/Nginx) in Docker:
```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`
- MySQL: `localhost:3306`

---

## 🧪 Running Automated Tests

Run backend unit and integration test suites:
```powershell
cd backend
mvn test "-Dspring.profiles.active=h2"
```
All unit tests verify:
- Authentication & JWT token generation
- Password hashing & invalid credentials rejection
- Double-booking collision prevention with HTTP 409 Conflict
- Invoice monetary calculations & overpayment prevention

---

## 🛡️ Security & Roles Matrix

| Feature | Admin | Doctor | Patient |
| :--- | :---: | :---: | :---: |
| Admin Dashboard & Analytics | ✅ | ❌ | ❌ |
| Doctor Credentialing & Deactivation | ✅ | ❌ | ❌ |
| Create Hospital Departments | ✅ | ❌ | ❌ |
| Book Appointment | ✅ | ❌ | ✅ |
| Confirm / Complete Appointment | ✅ | ✅ | ❌ |
| Cancel Appointment | ✅ | ✅ | ✅ (Own) |
| Clinical Diagnoses & Medical Records | ✅ | ✅ (Write) | ✅ (View Own) |
| Electronic Prescriptions | ❌ | ✅ (Write) | ✅ (View Own) |
| Itemized Invoice Creation | ✅ | ❌ | ❌ |
| Invoice Payment (Simulated Gateway) | ✅ | ❌ | ✅ (Own) |
| System Audit Trail | ✅ | ❌ | ❌ |

---

## 🩺 Troubleshooting

- **Port 8080 or 5173 in use**: Change `server.port` in `application.yml` or pass `--port 5174` in `npm run dev`.
- **CORS Error**: Ensure `app.cors.allowed-origins` includes your frontend origin (`http://localhost:5173`).
- **Token Expired**: JWT tokens expire after 24 hours. The frontend automatically intercepts 401s and prompts sign-in.
