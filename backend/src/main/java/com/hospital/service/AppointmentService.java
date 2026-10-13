package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.*;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final EntityDtoMapper mapper;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository,
                              NotificationService notificationService,
                              AuditLogService auditLogService,
                              EntityDtoMapper mapper) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AppointmentResponse bookAppointment(AppointmentRequest request, UserPrincipal currentUser) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        if (!doctor.isAvailable()) {
            throw new BadRequestException("Doctor " + doctor.getUser().getFullName() + " is currently not available for bookings");
        }

        Patient patient;
        if (currentUser.getRole() == Role.PATIENT) {
            patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + currentUser.getId()));
        } else {
            if (request.getPatientId() == null) {
                throw new BadRequestException("Patient ID is required when booking as Admin or Doctor");
            }
            patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));
        }

        // Validate appointment time (e.g., standard round minutes, working hours 08:00 - 18:00)
        LocalTime time = request.getAppointmentTime();
        if (time.isBefore(LocalTime.of(8, 0)) || time.isAfter(LocalTime.of(18, 0))) {
            throw new BadRequestException("Appointment time must be within working hours (08:00 to 18:00)");
        }

        // Prevent double booking for the doctor on date & time
        boolean alreadyBooked = appointmentRepository.existsActiveAppointmentForDoctor(
                doctor.getId(), request.getAppointmentDate(), request.getAppointmentTime()
        );
        if (alreadyBooked) {
            throw new ConflictException(
                    "Doctor already has an active appointment on " + request.getAppointmentDate() +
                    " at " + request.getAppointmentTime() + ". Please choose another slot."
            );
        }

        Appointment appointment = new Appointment(
                patient,
                doctor,
                request.getAppointmentDate(),
                request.getAppointmentTime(),
                request.getReasonForVisit(),
                request.getNotes()
        );
        appointment = appointmentRepository.save(appointment);

        // Send notifications
        notificationService.createNotification(
                doctor.getUser(),
                "New Appointment Booked",
                "Patient " + patient.getUser().getFullName() + " booked an appointment on " +
                        appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime(),
                NotificationType.APPOINTMENT
        );

        notificationService.createNotification(
                patient.getUser(),
                "Appointment Requested",
                "Your appointment with Dr. " + doctor.getUser().getFullName() + " on " +
                        appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime() + " is currently PENDING confirmation.",
                NotificationType.APPOINTMENT
        );

        auditLogService.log(
                patient.getUser(),
                "BOOK_APPOINTMENT",
                "Appointment",
                appointment.getId().toString(),
                null,
                "Booked appointment with Dr. " + doctor.getUser().getFullName()
        );

        return mapper.toAppointmentResponse(appointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAppointments(
            Long doctorId, Long patientId, AppointmentStatus status, LocalDate date,
            Pageable pageable, UserPrincipal currentUser) {

        // Enforce RBAC
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
            patientId = patient.getId();
        } else if (currentUser.getRole() == Role.DOCTOR) {
            Doctor doctor = doctorRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            doctorId = doctor.getId();
        }

        return appointmentRepository.filterAppointments(doctorId, patientId, status, date, pageable)
                .map(mapper::toAppointmentResponse);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id, UserPrincipal currentUser) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        // Check permission
        if (currentUser.getRole() == Role.PATIENT) {
            if (!appointment.getPatient().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to view this appointment");
            }
        } else if (currentUser.getRole() == Role.DOCTOR) {
            if (!appointment.getDoctor().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to view this appointment");
            }
        }

        return mapper.toAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatus newStatus, UserPrincipal currentUser) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        // Only Admin or assigned Doctor can confirm or complete
        if (currentUser.getRole() == Role.DOCTOR) {
            if (!appointment.getDoctor().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("Only the assigned doctor can update this appointment status");
            }
        } else if (currentUser.getRole() == Role.PATIENT) {
            if (newStatus != AppointmentStatus.CANCELLED) {
                throw new UnauthorizedException("Patients can only cancel appointments");
            }
        }

        appointment.setStatus(newStatus);
        appointment = appointmentRepository.save(appointment);

        // Notify patient
        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Appointment Status Updated",
                "Your appointment with Dr. " + appointment.getDoctor().getUser().getFullName() +
                        " is now " + newStatus.name(),
                NotificationType.APPOINTMENT
        );

        auditLogService.log(
                null,
                "UPDATE_APPOINTMENT_STATUS",
                "Appointment",
                appointment.getId().toString(),
                null,
                "Appointment status updated to " + newStatus
        );

        return mapper.toAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long id, UserPrincipal currentUser) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        // Check if patient owns this or doctor/admin
        if (currentUser.getRole() == Role.PATIENT) {
            if (!appointment.getPatient().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You cannot cancel another patient's appointment");
            }
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);

        notificationService.createNotification(
                appointment.getDoctor().getUser(),
                "Appointment Cancelled",
                "Appointment on " + appointment.getAppointmentDate() + " at " +
                        appointment.getAppointmentTime() + " has been cancelled.",
                NotificationType.APPOINTMENT
        );

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Appointment Cancelled",
                "Your appointment with Dr. " + appointment.getDoctor().getUser().getFullName() + " has been cancelled.",
                NotificationType.APPOINTMENT
        );

        return mapper.toAppointmentResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<LocalTime> getBookedTimeslots(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusNot(doctorId, date, AppointmentStatus.CANCELLED)
                .stream()
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toList());
    }
}
