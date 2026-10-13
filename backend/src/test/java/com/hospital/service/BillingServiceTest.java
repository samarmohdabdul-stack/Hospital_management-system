package com.hospital.service;

import com.hospital.dto.InvoiceItemDto;
import com.hospital.dto.InvoiceRequest;
import com.hospital.dto.PaymentRequest;
import com.hospital.entity.*;
import com.hospital.exception.BadRequestException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.InvoiceRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PaymentRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private BillingService billingService;

    private Patient patient;
    private User patientUser;
    private UserPrincipal patientPrincipal;

    @BeforeEach
    void setUp() {
        patientUser = new User("alice@test.com", "pass", "Alice", "Walker", "111", Role.PATIENT);
        patientUser.setId(10L);
        patient = new Patient(patientUser, LocalDate.of(1990, 1, 1), "FEMALE", "A+", "Address", "Contact", "222", "None");
        patient.setId(1L);

        patientPrincipal = new UserPrincipal(10L, "alice@test.com", "pass", "Alice", "Walker",
                Role.PATIENT, true, List.of(new SimpleGrantedAuthority("ROLE_PATIENT")));
    }

    @Test
    @DisplayName("Should create invoice and calculate total correctly")
    void createInvoice_CalculatesTotal() {
        InvoiceRequest request = new InvoiceRequest();
        request.setPatientId(1L);
        request.setConsultationFee(new BigDecimal("100.00"));
        request.setTaxAmount(new BigDecimal("10.00"));
        request.setDiscountAmount(new BigDecimal("5.00"));
        request.setItems(List.of(
                new InvoiceItemDto(null, "Blood Test", new BigDecimal("50.00")),
                new InvoiceItemDto(null, "ECG", new BigDecimal("40.00"))
        ));

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice inv = invocation.getArgument(0);
            inv.setId(101L);
            return inv;
        });

        billingService.createInvoice(request);

        verify(invoiceRepository).save(argThat(invoice -> {
            // Subtotal: 100 + 50 + 40 = 190. Tax: +10. Discount: -5. Total should be 195.00.
            return invoice.getTotalAmount().compareTo(new BigDecimal("195.00")) == 0 &&
                   invoice.getStatus() == InvoiceStatus.UNPAID;
        }));
    }

    @Test
    @DisplayName("Should reject payment exceeding remaining balance")
    void recordPayment_ThrowsBadRequest_WhenAmountExceedsBalance() {
        Invoice invoice = new Invoice("INV-001", patient, null, new BigDecimal("100.00"),
                BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("100.00"), LocalDate.now(), null);
        invoice.setId(50L);
        invoice.setPaidAmount(new BigDecimal("40.00")); // remaining balance is 60.00

        when(invoiceRepository.findById(50L)).thenReturn(Optional.of(invoice));

        PaymentRequest paymentRequest = new PaymentRequest(new BigDecimal("70.00"), PaymentMethod.CREDIT_CARD, "Test payment");

        assertThrows(BadRequestException.class, () -> billingService.recordPayment(50L, paymentRequest, patientPrincipal));
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
