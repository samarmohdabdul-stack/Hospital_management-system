package com.hospital.service;

import com.hospital.dto.DoctorRequest;
import com.hospital.dto.DoctorResponse;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.ConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityDtoMapper mapper;
    private final AuditLogService auditLogService;

    public DoctorService(DoctorRepository doctorRepository,
                         UserRepository userRepository,
                         DepartmentRepository departmentRepository,
                         PasswordEncoder passwordEncoder,
                         EntityDtoMapper mapper,
                         AuditLogService auditLogService) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<DoctorResponse> searchDoctors(Long departmentId, String query, Pageable pageable) {
        return doctorRepository.searchDoctors(departmentId, query, pageable)
                .map(mapper::toDoctorResponse);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapper.toDoctorResponse(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + userId));
        return mapper.toDoctorResponse(doctor);
    }

    @Transactional
    public DoctorResponse createDoctor(DoctorRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword() : "Doctor@123";

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(rawPassword),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone(),
                Role.DOCTOR
        );
        user = userRepository.save(user);

        Doctor doctor = new Doctor(
                user,
                department,
                request.getSpecialization(),
                request.getQualification(),
                request.getExperienceYears(),
                request.getConsultationFee(),
                request.getBio()
        );
        if (request.getAvailable() != null) {
            doctor.setAvailable(request.getAvailable());
        }
        doctor = doctorRepository.save(doctor);

        auditLogService.log(user, "CREATE_DOCTOR", "Doctor", doctor.getId().toString(), null, "Created doctor: " + user.getFullName());

        return mapper.toDoctorResponse(doctor);
    }

    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));

        User user = doctor.getUser();
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            doctor.setDepartment(department);
        }

        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getQualification() != null) doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getBio() != null) doctor.setBio(request.getBio());
        if (request.getAvailable() != null) doctor.setAvailable(request.getAvailable());

        doctor = doctorRepository.save(doctor);
        auditLogService.log(null, "UPDATE_DOCTOR", "Doctor", doctor.getId().toString(), null, "Updated doctor: " + user.getFullName());

        return mapper.toDoctorResponse(doctor);
    }

    @Transactional
    public DoctorResponse updateDoctorAvailability(Long id, boolean available) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        doctor.setAvailable(available);
        doctor = doctorRepository.save(doctor);
        return mapper.toDoctorResponse(doctor);
    }

    @Transactional
    public void deactivateDoctorUser(Long id, boolean active) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        User user = doctor.getUser();
        user.setActive(active);
        userRepository.save(user);
        auditLogService.log(null, active ? "ACTIVATE_DOCTOR" : "DEACTIVATE_DOCTOR", "Doctor", id.toString(), null, "Doctor active state changed to " + active);
    }
}
