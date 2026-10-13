package com.hospital.service;

import com.hospital.dto.MedicalRecordRequest;
import com.hospital.dto.MedicalRecordResponse;
import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditLogService auditLogService;
    private final EntityDtoMapper mapper;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                PatientRepository patientRepository,
                                DoctorRepository doctorRepository,
                                AppointmentRepository appointmentRepository,
                                AuditLogService auditLogService,
                                EntityDtoMapper mapper) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request, UserPrincipal currentUser) {
        Doctor doctor;
        if (currentUser.getRole() == Role.DOCTOR) {
            doctor = doctorRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        } else {
            throw new UnauthorizedException("Only doctors can create clinical medical records");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        MedicalRecord record = new MedicalRecord(
                patient,
                doctor,
                appointment,
                request.getConsultationDate(),
                request.getSymptoms(),
                request.getDiagnosis(),
                request.getClinicalNotes(),
                request.getTreatmentPlan(),
                request.getFollowUpDate()
        );

        record = medicalRecordRepository.save(record);

        auditLogService.log(
                doctor.getUser(),
                "CREATE_MEDICAL_RECORD",
                "MedicalRecord",
                record.getId().toString(),
                null,
                "Created medical record for patient: " + patient.getUser().getFullName()
        );

        return mapper.toMedicalRecordResponse(record);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getPatientMedicalRecords(Long patientId, UserPrincipal currentUser) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        if (currentUser.getRole() == Role.PATIENT) {
            if (!patient.getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("Patients can only view their own medical records");
            }
        }

        return medicalRecordRepository.findByPatientIdOrderByConsultationDateDesc(patientId)
                .stream()
                .map(mapper::toMedicalRecordResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getMedicalRecordById(Long id, UserPrincipal currentUser) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));

        if (currentUser.getRole() == Role.PATIENT) {
            if (!record.getPatient().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to view this medical record");
            }
        }

        return mapper.toMedicalRecordResponse(record);
    }
}
