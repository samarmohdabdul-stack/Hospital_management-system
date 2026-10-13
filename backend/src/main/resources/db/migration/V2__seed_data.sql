-- ========================================================
-- V2__seed_data.sql : Initial Seed Data
-- Passwords below are bcrypt for "password123":
-- $2a$10$Dow1q6g61vPjGqB4k4m0yOi7F1lT7.O4v5Xq3Y9I2S8sZ.sB5U1G6
-- ========================================================

-- Seed Departments
INSERT INTO departments (id, name, description, head_doctor_name, created_at, updated_at) VALUES
(1, 'Cardiology', 'Specialized care for heart and cardiovascular disorders.', 'Dr. Robert Smith', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Neurology', 'Diagnosis and treatment of neurological and brain conditions.', 'Dr. Emily Watson', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Orthopedics', 'Musculoskeletal system care, joints, bones, and spine.', 'Dr. Michael Chen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Pediatrics', 'Comprehensive healthcare and treatment for infants, children, and teens.', 'Dr. Sarah Johnson', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'General Medicine', 'Primary healthcare, preventive care, and adult diagnosis.', 'Dr. David Miller', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name=name;

-- Seed Admin User (admin@hospital.com / password123)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_active, created_at, updated_at) VALUES
(1, 'admin@hospital.com', '$2a$10$Dow1q6g61vPjGqB4k4m0yOi7F1lT7.O4v5Xq3Y9I2S8sZ.sB5U1G6', 'System', 'Administrator', '+1-555-0100', 'ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE email=email;

-- Seed Doctor Users (doctor1@hospital.com, doctor2@hospital.com, doctor3@hospital.com)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_active, created_at, updated_at) VALUES
(2, 'doctor1@hospital.com', '$2a$10$Dow1q6g61vPjGqB4k4m0yOi7F1lT7.O4v5Xq3Y9I2S8sZ.sB5U1G6', 'Robert', 'Smith', '+1-555-0101', 'DOCTOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'doctor2@hospital.com', '$2a$10$Dow1q6g61vPjGqB4k4m0yOi7F1lT7.O4v5Xq3Y9I2S8sZ.sB5U1G6', 'Emily', 'Watson', '+1-555-0102', 'DOCTOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'doctor3@hospital.com', '$2a$10$Dow1q6g61vPjGqB4k4m0yOi7F1lT7.O4v5Xq3Y9I2S8sZ.sB5U1G6', 'Michael', 'Chen', '+1-555-0103', 'DOCTOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE email=email;

-- Seed Doctors Profiles
INSERT INTO doctors (id, user_id, department_id, specialization, qualification, experience_years, consultation_fee, bio, is_available, created_at, updated_at) VALUES
(1, 2, 1, 'Cardiologist', 'MD, FACC - Harvard Medical School', 14, 120.00, 'Experienced cardiologist specializing in clinical cardiology and echocardiography.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 2, 'Neurologist', 'MD, PhD - Johns Hopkins', 10, 150.00, 'Expert in cerebrovascular diseases and neurological rehabilitation.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 4, 3, 'Orthopedic Surgeon', 'MS Orthopedics - Stanford University', 12, 110.00, 'Specialist in joint replacements, sports injuries, and spine conditions.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE specialization=specialization;

-- Seed Patient Users (patient1@hospital.com, patient2@hospital.com)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_active, created_at, updated_at) VALUES
(5, 'patient1@hospital.com', '$2a$10$Dow1q6g61vPjGqB4k4m0yOi7F1lT7.O4v5Xq3Y9I2S8sZ.sB5U1G6', 'Alice', 'Walker', '+1-555-0201', 'PATIENT', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'patient2@hospital.com', '$2a$10$Dow1q6g61vPjGqB4k4m0yOi7F1lT7.O4v5Xq3Y9I2S8sZ.sB5U1G6', 'John', 'Doe', '+1-555-0202', 'PATIENT', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE email=email;

-- Seed Patient Profiles
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact_name, emergency_contact_phone, allergies, created_at, updated_at) VALUES
(1, 5, '1990-05-14', 'FEMALE', 'A+', '742 Evergreen Terrace, Springfield', 'Bob Walker', '+1-555-0299', 'Penicillin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 6, '1985-11-23', 'MALE', 'O+', '100 Main Street, Suite 4A, Metropolis', 'Mary Doe', '+1-555-0298', 'None known', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE gender=gender;
