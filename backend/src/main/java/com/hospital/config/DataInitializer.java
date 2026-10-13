package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           DoctorRepository doctorRepository,
                           PatientRepository patientRepository,
                           AppointmentRepository appointmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        logger.info("Verifying initial hospital data seeds...");

        // Ensure Departments
        Department cardiology = getOrCreateDepartment("Cardiology", "Specialized care for heart and cardiovascular disorders.", "Dr. Robert Smith");
        Department neurology = getOrCreateDepartment("Neurology", "Diagnosis and treatment of neurological and brain conditions.", "Dr. Emily Watson");
        Department orthopedics = getOrCreateDepartment("Orthopedics", "Musculoskeletal system care, joints, bones, and spine.", "Dr. Michael Chen");
        Department pediatrics = getOrCreateDepartment("Pediatrics", "Comprehensive healthcare and treatment for infants and children.", "Dr. Sarah Johnson");
        Department generalMed = getOrCreateDepartment("General Medicine", "Primary healthcare, preventive care, and adult diagnosis.", "Dr. David Miller");

        // Ensure Admin
        if (!userRepository.existsByEmail("admin@hospital.com")) {
            User admin = new User(
                    "admin@hospital.com",
                    passwordEncoder.encode("password123"),
                    "System",
                    "Administrator",
                    "+1-555-0100",
                    Role.ADMIN
            );
            userRepository.save(admin);
            logger.info("Admin user created: admin@hospital.com");
        }

        // Ensure Doctor 1
        Doctor doc1 = getOrCreateDoctor(
                "doctor1@hospital.com",
                "Robert",
                "Smith",
                "+1-555-0101",
                cardiology,
                "Cardiologist",
                "MD, FACC - Harvard Medical School",
                14,
                new BigDecimal("120.00"),
                "Experienced cardiologist specializing in clinical cardiology and echocardiography."
        );

        // Ensure Doctor 2
        Doctor doc2 = getOrCreateDoctor(
                "doctor2@hospital.com",
                "Emily",
                "Watson",
                "+1-555-0102",
                neurology,
                "Neurologist",
                "MD, PhD - Johns Hopkins",
                10,
                new BigDecimal("150.00"),
                "Expert in cerebrovascular diseases and neurological rehabilitation."
        );

        // Ensure Doctor 3
        Doctor doc3 = getOrCreateDoctor(
                "doctor3@hospital.com",
                "Michael",
                "Chen",
                "+1-555-0103",
                orthopedics,
                "Orthopedic Surgeon",
                "MS Orthopedics - Stanford University",
                12,
                new BigDecimal("110.00"),
                "Specialist in joint replacements, sports injuries, and spine conditions."
        );

        // Ensure Patient 1
        Patient patient1 = getOrCreatePatient(
                "patient1@hospital.com",
                "Alice",
                "Walker",
                "+1-555-0201",
                LocalDate.of(1990, 5, 14),
                "FEMALE",
                "A+",
                "742 Evergreen Terrace, Springfield",
                "Bob Walker",
                "+1-555-0299",
                "Penicillin"
        );

        // Ensure Patient 2
        Patient patient2 = getOrCreatePatient(
                "patient2@hospital.com",
                "John",
                "Doe",
                "+1-555-0202",
                LocalDate.of(1985, 11, 23),
                "MALE",
                "O+",
                "100 Main Street, Suite 4A, Metropolis",
                "Mary Doe",
                "+1-555-0298",
                "None known"
        );

        // Ensure sample appointment
        if (appointmentRepository.count() == 0 && doc1 != null && patient1 != null) {
            Appointment app1 = new Appointment(
                    patient1,
                    doc1,
                    LocalDate.now().plusDays(1),
                    LocalTime.of(10, 0),
                    "Routine cardiac checkup and blood pressure assessment",
                    "Patient reported mild fatigue in evenings"
            );
            app1.setStatus(AppointmentStatus.CONFIRMED);
            appointmentRepository.save(app1);

            Appointment app2 = new Appointment(
                    patient2,
                    doc2,
                    LocalDate.now().plusDays(2),
                    LocalTime.of(14, 30),
                    "Frequent tension headaches and migraine episodes",
                    "Needs neurologist review"
            );
            app2.setStatus(AppointmentStatus.PENDING);
            appointmentRepository.save(app2);
        }

        logger.info("Data initialization check completed.");
    }

    private Department getOrCreateDepartment(String name, String desc, String headDoctor) {
        return departmentRepository.findByName(name).orElseGet(() -> {
            Department d = new Department(name, desc, headDoctor);
            return departmentRepository.save(d);
        });
    }

    private Doctor getOrCreateDoctor(String email, String first, String last, String phone,
                                     Department dept, String spec, String qual, int exp, BigDecimal fee, String bio) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User(email, passwordEncoder.encode("password123"), first, last, phone, Role.DOCTOR);
            return userRepository.save(u);
        });

        return doctorRepository.findByUserId(user.getId()).orElseGet(() -> {
            Doctor doc = new Doctor(user, dept, spec, qual, exp, fee, bio);
            return doctorRepository.save(doc);
        });
    }

    private Patient getOrCreatePatient(String email, String first, String last, String phone,
                                       LocalDate dob, String gender, String blood, String addr,
                                       String emerName, String emerPhone, String allergies) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User(email, passwordEncoder.encode("password123"), first, last, phone, Role.PATIENT);
            return userRepository.save(u);
        });

        return patientRepository.findByUserId(user.getId()).orElseGet(() -> {
            Patient p = new Patient(user, dob, gender, blood, addr, emerName, emerPhone, allergies);
            return patientRepository.save(p);
        });
    }
}
