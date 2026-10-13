package com.hospital.mapper;

import com.hospital.dto.*;
import com.hospital.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityDtoMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }

    public DepartmentResponse toDepartmentResponse(Department dept, long doctorCount) {
        if (dept == null) return null;
        return new DepartmentResponse(
                dept.getId(),
                dept.getName(),
                dept.getDescription(),
                dept.getHeadDoctorName(),
                doctorCount,
                dept.getCreatedAt()
        );
    }

    public DoctorResponse toDoctorResponse(Doctor doc) {
        if (doc == null) return null;
        DoctorResponse res = new DoctorResponse();
        res.setId(doc.getId());
        if (doc.getUser() != null) {
            res.setUserId(doc.getUser().getId());
            res.setEmail(doc.getUser().getEmail());
            res.setFirstName(doc.getUser().getFirstName());
            res.setLastName(doc.getUser().getLastName());
            res.setPhone(doc.getUser().getPhone());
        }
        if (doc.getDepartment() != null) {
            res.setDepartmentId(doc.getDepartment().getId());
            res.setDepartmentName(doc.getDepartment().getName());
        }
        res.setSpecialization(doc.getSpecialization());
        res.setQualification(doc.getQualification());
        res.setExperienceYears(doc.getExperienceYears());
        res.setConsultationFee(doc.getConsultationFee());
        res.setBio(doc.getBio());
        res.setAvailable(doc.isAvailable());
        res.setCreatedAt(doc.getCreatedAt());
        return res;
    }

    public PatientResponse toPatientResponse(Patient p) {
        if (p == null) return null;
        PatientResponse res = new PatientResponse();
        res.setId(p.getId());
        if (p.getUser() != null) {
            res.setUserId(p.getUser().getId());
            res.setEmail(p.getUser().getEmail());
            res.setFirstName(p.getUser().getFirstName());
            res.setLastName(p.getUser().getLastName());
            res.setPhone(p.getUser().getPhone());
        }
        res.setDateOfBirth(p.getDateOfBirth());
        res.setGender(p.getGender());
        res.setBloodGroup(p.getBloodGroup());
        res.setAddress(p.getAddress());
        res.setEmergencyContactName(p.getEmergencyContactName());
        res.setEmergencyContactPhone(p.getEmergencyContactPhone());
        res.setAllergies(p.getAllergies());
        res.setCreatedAt(p.getCreatedAt());
        return res;
    }

    public AppointmentResponse toAppointmentResponse(Appointment a) {
        if (a == null) return null;
        AppointmentResponse res = new AppointmentResponse();
        res.setId(a.getId());
        if (a.getPatient() != null) {
            res.setPatientId(a.getPatient().getId());
            if (a.getPatient().getUser() != null) {
                res.setPatientName(a.getPatient().getUser().getFullName());
                res.setPatientPhone(a.getPatient().getUser().getPhone());
            }
        }
        if (a.getDoctor() != null) {
            res.setDoctorId(a.getDoctor().getId());
            if (a.getDoctor().getUser() != null) {
                res.setDoctorName(a.getDoctor().getUser().getFullName());
            }
            res.setDoctorSpecialization(a.getDoctor().getSpecialization());
            res.setConsultationFee(a.getDoctor().getConsultationFee());
            if (a.getDoctor().getDepartment() != null) {
                res.setDepartmentName(a.getDoctor().getDepartment().getName());
            }
        }
        res.setAppointmentDate(a.getAppointmentDate());
        res.setAppointmentTime(a.getAppointmentTime());
        res.setStatus(a.getStatus());
        res.setReasonForVisit(a.getReasonForVisit());
        res.setNotes(a.getNotes());
        res.setCreatedAt(a.getCreatedAt());
        return res;
    }

    public MedicalRecordResponse toMedicalRecordResponse(MedicalRecord mr) {
        if (mr == null) return null;
        MedicalRecordResponse res = new MedicalRecordResponse();
        res.setId(mr.getId());
        if (mr.getPatient() != null) {
            res.setPatientId(mr.getPatient().getId());
            if (mr.getPatient().getUser() != null) {
                res.setPatientName(mr.getPatient().getUser().getFullName());
            }
        }
        if (mr.getDoctor() != null) {
            res.setDoctorId(mr.getDoctor().getId());
            if (mr.getDoctor().getUser() != null) {
                res.setDoctorName(mr.getDoctor().getUser().getFullName());
            }
            res.setDoctorSpecialization(mr.getDoctor().getSpecialization());
        }
        if (mr.getAppointment() != null) {
            res.setAppointmentId(mr.getAppointment().getId());
        }
        res.setConsultationDate(mr.getConsultationDate());
        res.setSymptoms(mr.getSymptoms());
        res.setDiagnosis(mr.getDiagnosis());
        res.setClinicalNotes(mr.getClinicalNotes());
        res.setTreatmentPlan(mr.getTreatmentPlan());
        res.setFollowUpDate(mr.getFollowUpDate());
        res.setCreatedAt(mr.getCreatedAt());
        return res;
    }

    public PrescriptionItemDto toPrescriptionItemDto(PrescriptionItem item) {
        if (item == null) return null;
        return new PrescriptionItemDto(
                item.getId(),
                item.getMedicationName(),
                item.getDosage(),
                item.getFrequency(),
                item.getDuration(),
                item.getInstructions()
        );
    }

    public PrescriptionResponse toPrescriptionResponse(Prescription p) {
        if (p == null) return null;
        PrescriptionResponse res = new PrescriptionResponse();
        res.setId(p.getId());
        if (p.getPatient() != null) {
            res.setPatientId(p.getPatient().getId());
            if (p.getPatient().getUser() != null) {
                res.setPatientName(p.getPatient().getUser().getFullName());
            }
        }
        if (p.getDoctor() != null) {
            res.setDoctorId(p.getDoctor().getId());
            if (p.getDoctor().getUser() != null) {
                res.setDoctorName(p.getDoctor().getUser().getFullName());
            }
            res.setDoctorSpecialization(p.getDoctor().getSpecialization());
        }
        if (p.getAppointment() != null) {
            res.setAppointmentId(p.getAppointment().getId());
        }
        res.setIssueDate(p.getIssueDate());
        res.setNotes(p.getNotes());
        res.setCreatedAt(p.getCreatedAt());
        if (p.getItems() != null) {
            res.setItems(p.getItems().stream().map(this::toPrescriptionItemDto).collect(Collectors.toList()));
        } else {
            res.setItems(new ArrayList<>());
        }
        return res;
    }

    public InvoiceItemDto toInvoiceItemDto(InvoiceItem item) {
        if (item == null) return null;
        return new InvoiceItemDto(item.getId(), item.getDescription(), item.getAmount());
    }

    public PaymentResponse toPaymentResponse(Payment pay) {
        if (pay == null) return null;
        PaymentResponse res = new PaymentResponse();
        res.setId(pay.getId());
        if (pay.getInvoice() != null) {
            res.setInvoiceId(pay.getInvoice().getId());
        }
        res.setTransactionId(pay.getTransactionId());
        res.setAmount(pay.getAmount());
        res.setPaymentMethod(pay.getPaymentMethod());
        res.setPaymentDate(pay.getPaymentDate());
        res.setStatus(pay.getStatus());
        res.setNotes(pay.getNotes());
        return res;
    }

    public InvoiceResponse toInvoiceResponse(Invoice inv) {
        if (inv == null) return null;
        InvoiceResponse res = new InvoiceResponse();
        res.setId(inv.getId());
        res.setInvoiceNumber(inv.getInvoiceNumber());
        if (inv.getPatient() != null) {
            res.setPatientId(inv.getPatient().getId());
            if (inv.getPatient().getUser() != null) {
                res.setPatientName(inv.getPatient().getUser().getFullName());
            }
        }
        if (inv.getAppointment() != null) {
            res.setAppointmentId(inv.getAppointment().getId());
        }
        res.setConsultationFee(inv.getConsultationFee());
        res.setTaxAmount(inv.getTaxAmount());
        res.setDiscountAmount(inv.getDiscountAmount());
        res.setTotalAmount(inv.getTotalAmount());
        res.setPaidAmount(inv.getPaidAmount());
        BigDecimal balance = (inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO)
                .subtract(inv.getPaidAmount() != null ? inv.getPaidAmount() : BigDecimal.ZERO);
        res.setBalanceAmount(balance.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : balance);
        res.setStatus(inv.getStatus());
        res.setIssueDate(inv.getIssueDate());
        res.setDueDate(inv.getDueDate());
        res.setCreatedAt(inv.getCreatedAt());

        if (inv.getItems() != null) {
            res.setItems(inv.getItems().stream().map(this::toInvoiceItemDto).collect(Collectors.toList()));
        } else {
            res.setItems(new ArrayList<>());
        }

        if (inv.getPayments() != null) {
            res.setPayments(inv.getPayments().stream().map(this::toPaymentResponse).collect(Collectors.toList()));
        } else {
            res.setPayments(new ArrayList<>());
        }
        return res;
    }

    public NotificationResponse toNotificationResponse(Notification n) {
        if (n == null) return null;
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }

    public AuditLogResponse toAuditLogResponse(AuditLog log) {
        if (log == null) return null;
        AuditLogResponse res = new AuditLogResponse();
        res.setId(log.getId());
        if (log.getUser() != null) {
            res.setUserId(log.getUser().getId());
            res.setUserEmail(log.getUser().getEmail());
        }
        res.setAction(log.getAction());
        res.setResourceName(log.getResourceName());
        res.setResourceId(log.getResourceId());
        res.setIpAddress(log.getIpAddress());
        res.setDetails(log.getDetails());
        res.setTimestamp(log.getTimestamp());
        return res;
    }
}
