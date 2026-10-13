package com.hospital.service;

import com.hospital.dto.InvoiceItemDto;
import com.hospital.dto.InvoiceRequest;
import com.hospital.dto.InvoiceResponse;
import com.hospital.dto.PaymentRequest;
import com.hospital.dto.PaymentResponse;
import com.hospital.entity.*;
import com.hospital.exception.BadRequestException;
import com.hospital.exception.ConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.UnauthorizedException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.InvoiceRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PaymentRepository;
import com.hospital.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final EntityDtoMapper mapper;

    public BillingService(InvoiceRepository invoiceRepository,
                          PaymentRepository paymentRepository,
                          PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          NotificationService notificationService,
                          AuditLogService auditLogService,
                          EntityDtoMapper mapper) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId()).orElse(null);
        }

        String invoiceNumber = "INV-" + System.currentTimeMillis();

        Invoice invoice = new Invoice(
                invoiceNumber,
                patient,
                appointment,
                request.getConsultationFee(),
                request.getTaxAmount(),
                request.getDiscountAmount(),
                BigDecimal.ZERO, // will recalculate
                LocalDate.now(),
                request.getDueDate()
        );

        if (request.getItems() != null) {
            for (InvoiceItemDto itemDto : request.getItems()) {
                invoice.addItem(new InvoiceItem(itemDto.getDescription(), itemDto.getAmount()));
            }
        }

        invoice.recalculateTotal();
        invoice = invoiceRepository.save(invoice);

        notificationService.createNotification(
                patient.getUser(),
                "New Invoice Generated",
                "Invoice #" + invoice.getInvoiceNumber() + " for total $" + invoice.getTotalAmount() + " is ready for review.",
                NotificationType.BILLING
        );

        auditLogService.log(
                null,
                "CREATE_INVOICE",
                "Invoice",
                invoice.getId().toString(),
                null,
                "Created invoice " + invoice.getInvoiceNumber() + " total: $" + invoice.getTotalAmount()
        );

        return mapper.toInvoiceResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoices(Long patientId, InvoiceStatus status, Pageable pageable, UserPrincipal currentUser) {
        if (currentUser.getRole() == Role.PATIENT) {
            Patient patient = patientRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
            patientId = patient.getId();
        }

        return invoiceRepository.filterInvoices(patientId, status, pageable)
                .map(mapper::toInvoiceResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id, UserPrincipal currentUser) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (currentUser.getRole() == Role.PATIENT) {
            if (!invoice.getPatient().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not authorized to view this invoice");
            }
        }

        return mapper.toInvoiceResponse(invoice);
    }

    @Transactional
    public PaymentResponse recordPayment(Long invoiceId, PaymentRequest request, UserPrincipal currentUser) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        if (currentUser.getRole() == Role.PATIENT) {
            if (!invoice.getPatient().getUser().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You cannot pay another patient's invoice");
            }
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Invoice is already fully paid");
        }
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot make payments for a cancelled invoice");
        }

        BigDecimal remainingBalance = invoice.getTotalAmount().subtract(invoice.getPaidAmount());
        if (request.getAmount().compareTo(remainingBalance) > 0) {
            throw new BadRequestException("Payment amount ($" + request.getAmount() +
                    ") exceeds remaining balance ($" + remainingBalance + ")");
        }

        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        if (paymentRepository.existsByTransactionId(transactionId)) {
            throw new ConflictException("Duplicate transaction generated. Please retry.");
        }

        Payment payment = new Payment(
                invoice,
                transactionId,
                request.getAmount(),
                request.getPaymentMethod(),
                PaymentStatus.SUCCESS,
                request.getNotes() != null ? request.getNotes() : "Payment processed via simulated gateway"
        );
        payment = paymentRepository.save(payment);

        invoice.setPaidAmount(invoice.getPaidAmount().add(request.getAmount()));
        invoice.updateStatusBasedOnPayments();
        invoiceRepository.save(invoice);

        notificationService.createNotification(
                invoice.getPatient().getUser(),
                "Payment Confirmation",
                "Payment of $" + payment.getAmount() + " received for Invoice #" +
                        invoice.getInvoiceNumber() + ". Transaction ID: " + payment.getTransactionId(),
                NotificationType.BILLING
        );

        auditLogService.log(
                invoice.getPatient().getUser(),
                "RECORD_PAYMENT",
                "Payment",
                payment.getId().toString(),
                null,
                "Payment of $" + payment.getAmount() + " on invoice " + invoice.getInvoiceNumber()
        );

        return mapper.toPaymentResponse(payment);
    }
}
