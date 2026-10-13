package com.hospital.service;

import com.hospital.dto.PatientRequest;
import com.hospital.dto.PatientResponse;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final EntityDtoMapper mapper;
    private final AuditLogService auditLogService;

    public PatientService(PatientRepository patientRepository,
                          UserRepository userRepository,
                          EntityDtoMapper mapper,
                          AuditLogService auditLogService) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> searchPatients(String query, Pageable pageable) {
        return patientRepository.searchPatients(query, pageable)
                .map(mapper::toPatientResponse);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id, UserPrincipal currentUser) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        // Security check: If patient role, they can only view their own profile
        if (currentUser.getRole() == Role.PATIENT && !patient.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view another patient's profile");
        }

        return mapper.toPatientResponse(patient);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + userId));
        return mapper.toPatientResponse(patient);
    }

    @Transactional
    public PatientResponse updatePatient(Long id, PatientRequest request, UserPrincipal currentUser) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        if (currentUser.getRole() == Role.PATIENT && !patient.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update another patient's profile");
        }

        User user = patient.getUser();
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);

        if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) patient.setGender(request.getGender());
        if (request.getBloodGroup() != null) patient.setBloodGroup(request.getBloodGroup());
        if (request.getAddress() != null) patient.setAddress(request.getAddress());
        if (request.getEmergencyContactName() != null) patient.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getAllergies() != null) patient.setAllergies(request.getAllergies());

        patient = patientRepository.save(patient);

        auditLogService.log(user, "UPDATE_PATIENT_PROFILE", "Patient", patient.getId().toString(), null, "Updated patient profile");

        return mapper.toPatientResponse(patient);
    }
}
