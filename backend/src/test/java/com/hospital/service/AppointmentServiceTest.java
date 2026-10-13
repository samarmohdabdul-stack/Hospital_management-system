package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.AppointmentResponse;
import com.hospital.entity.*;
import com.hospital.exception.ConflictException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private AppointmentService appointmentService;

    private User doctorUser;
    private User patientUser;
    private Doctor doctor;
    private Patient patient;
    private UserPrincipal patientPrincipal;

    @BeforeEach
    void setUp() {
        doctorUser = new User("doc@hospital.com", "pass", "Robert", "Smith", "123", Role.DOCTOR);
        doctorUser.setId(10L);
        doctor = new Doctor(doctorUser, null, "Cardiology", "MD", 10, new BigDecimal("100"), "Bio");
        doctor.setId(1L);
        doctor.setAvailable(true);

        patientUser = new User("pat@hospital.com", "pass", "Alice", "Walker", "456", Role.PATIENT);
        patientUser.setId(20L);
        patient = new Patient(patientUser, LocalDate.of(1995, 1, 1), "FEMALE", "O+", "Address", "Bob", "789", "None");
        patient.setId(2L);

        patientPrincipal = new UserPrincipal(20L, "pat@hospital.com", "pass", "Alice", "Walker",
                Role.PATIENT, true, List.of(new SimpleGrantedAuthority("ROLE_PATIENT")));
    }

    @Test
    @DisplayName("Should successfully book appointment when slot is available")
    void bookAppointment_Success() {
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(1L);
        request.setAppointmentDate(LocalDate.now().plusDays(2));
        request.setAppointmentTime(LocalTime.of(10, 0));
        request.setReasonForVisit("Annual checkup");

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(patientRepository.findByUserId(20L)).thenReturn(Optional.of(patient));
        when(appointmentRepository.existsActiveAppointmentForDoctor(1L, request.getAppointmentDate(), request.getAppointmentTime()))
                .thenReturn(false);

        Appointment savedAppointment = new Appointment(patient, doctor, request.getAppointmentDate(), request.getAppointmentTime(), "Annual checkup", null);
        savedAppointment.setId(100L);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        AppointmentResponse expectedResponse = new AppointmentResponse();
        expectedResponse.setId(100L);
        expectedResponse.setStatus(AppointmentStatus.PENDING);
        when(mapper.toAppointmentResponse(savedAppointment)).thenReturn(expectedResponse);

        AppointmentResponse result = appointmentService.bookAppointment(request, patientPrincipal);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(AppointmentStatus.PENDING, result.getStatus());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when appointment slot overlaps (Double-booking prevention)")
    void bookAppointment_ThrowsConflictException_WhenDoubleBooked() {
        AppointmentRequest request = new AppointmentRequest();
        request.setDoctorId(1L);
        request.setAppointmentDate(LocalDate.now().plusDays(2));
        request.setAppointmentTime(LocalTime.of(10, 0));

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(patientRepository.findByUserId(20L)).thenReturn(Optional.of(patient));
        when(appointmentRepository.existsActiveAppointmentForDoctor(1L, request.getAppointmentDate(), request.getAppointmentTime()))
                .thenReturn(true);

        assertThrows(ConflictException.class, () -> appointmentService.bookAppointment(request, patientPrincipal));
        verify(appointmentRepository, never()).save(any(Appointment.class));
    }
}
