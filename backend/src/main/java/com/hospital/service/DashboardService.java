package com.hospital.service;

import com.hospital.dto.DashboardStatsResponse;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.InvoiceStatus;
import com.hospital.entity.Role;
import com.hospital.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardService(UserRepository userRepository,
                            DoctorRepository doctorRepository,
                            DepartmentRepository departmentRepository,
                            AppointmentRepository appointmentRepository,
                            InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.appointmentRepository = appointmentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getAdminDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long patientCount = userRepository.countByRole(Role.PATIENT);
        long doctorCount = doctorRepository.count();
        long deptCount = departmentRepository.count();
        long todayAppts = appointmentRepository.countByAppointmentDate(LocalDate.now());
        long pendingAppts = appointmentRepository.countByStatus(AppointmentStatus.PENDING);
        long completedAppts = appointmentRepository.countByStatus(AppointmentStatus.COMPLETED);
        long unpaidInvoices = invoiceRepository.countByStatus(InvoiceStatus.UNPAID) +
                              invoiceRepository.countByStatus(InvoiceStatus.PARTIALLY_PAID);

        BigDecimal totalRevenue = invoiceRepository.calculateTotalRevenue();
        BigDecimal outstandingAmount = invoiceRepository.calculateOutstandingAmount();

        Map<String, Long> statusMap = new HashMap<>();
        for (AppointmentStatus status : AppointmentStatus.values()) {
            statusMap.put(status.name(), appointmentRepository.countByStatus(status));
        }

        Map<String, Long> deptDocMap = new HashMap<>();
        departmentRepository.findAll().forEach(d -> {
            deptDocMap.put(d.getName(), (long) doctorRepository.findByDepartmentId(d.getId()).size());
        });

        stats.setTotalPatients(patientCount);
        stats.setTotalDoctors(doctorCount);
        stats.setTotalDepartments(deptCount);
        stats.setTodayAppointments(todayAppts);
        stats.setPendingAppointments(pendingAppts);
        stats.setCompletedAppointments(completedAppts);
        stats.setOutstandingInvoices(unpaidInvoices);
        stats.setTotalRevenue(totalRevenue);
        stats.setOutstandingAmount(outstandingAmount);
        stats.setAppointmentsByStatus(statusMap);
        stats.setDoctorsByDepartment(deptDocMap);

        return stats;
    }
}
