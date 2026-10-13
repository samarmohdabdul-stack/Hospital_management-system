package com.hospital.service;

import com.hospital.dto.PrescriptionItemDto;
import com.hospital.dto.PrescriptionRequest;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final EntityDtoMapper mapper;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               PatientRepository patientRepository,
                               DoctorRepository doctorRepository,
                               AppointmentRepository appointmentRepository,
                               NotificationService notificationService,
                               AuditLogService auditLogService,
                               EntityDtoMapper mapper) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request, UserPrincipal currentUser) {
        Doctor doctor;
        if (currentUser.getRole() == Role.DOCTOR) {
            doctor = doctorRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        } else {
            throw new UnauthorizedException("Only doctors can issue prescriptions");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        Prescription prescription = new Prescription(
                patient,
                doctor,
                appointment,
                request.getIssueDate(),
                request.getNotes()
        );

        if (request.getItems() != null) {
            for (PrescriptionItemDto itemDto : request.getItems()) {
                PrescriptionItem item = new PrescriptionItem(
                        itemDto.getMedicationName(),
                        itemDto.getDosage(),
                        itemDto.getFrequency(),
                        itemDto.getDuration(),
                        itemDto.getInstructions()
                );
                prescription.addItem(item);
            }
        }

        prescription = prescriptionRepository.save(prescription);

        notificationService.createNotification(
                patient.getUser(),
                "New Prescription Issued",
                "Dr. " + doctor.getUser().getFullName() + " has issued a new prescription for you.",
                NotificationType.PRESCRIPTION
        );

        auditLogService.log(
                doctor.getUser(),
                "CREATE_PRESCRIPTION",
                "Prescription",
                prescription.getId().toString(),
                null,
                "Issued prescription to patient: " + patient.getUser().getFullName()
        );

        return mapper.toPrescriptionResponse(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPatientPrescriptions(Long patientId, UserPrincipal currentUser) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        if (currentUser.getRole() == Role.PATIENT) {
            if (!patient.getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("Patients can only view their own prescriptions");
            }
        }

        return prescriptionRepository.findByPatientIdOrderByIssueDateDesc(patientId)
                .stream()
                .map(mapper::toPrescriptionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id, UserPrincipal currentUser) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        if (currentUser.getRole() == Role.PATIENT) {
            if (!prescription.getPatient().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to view this prescription");
            }
        }

        return mapper.toPrescriptionResponse(prescription);
    }
}
