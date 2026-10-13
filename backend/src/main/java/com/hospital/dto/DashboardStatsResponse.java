package com.hospital.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardStatsResponse {
    private long totalPatients;
    private long totalDoctors;
    private long totalDepartments;
    private long todayAppointments;
    private long pendingAppointments;
    private long completedAppointments;
    private long outstandingInvoices;
    private BigDecimal totalRevenue;
    private BigDecimal outstandingAmount;
    private Map<String, Long> appointmentsByStatus;
    private Map<String, Long> doctorsByDepartment;

    public DashboardStatsResponse() {}

    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

    public long getTotalDoctors() { return totalDoctors; }
    public void setTotalDoctors(long totalDoctors) { this.totalDoctors = totalDoctors; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

    public long getPendingAppointments() { return pendingAppointments; }
    public void setPendingAppointments(long pendingAppointments) { this.pendingAppointments = pendingAppointments; }

    public long getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(long completedAppointments) { this.completedAppointments = completedAppointments; }

    public long getOutstandingInvoices() { return outstandingInvoices; }
    public void setOutstandingInvoices(long outstandingInvoices) { this.outstandingInvoices = outstandingInvoices; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }

    public Map<String, Long> getAppointmentsByStatus() { return appointmentsByStatus; }
    public void setAppointmentsByStatus(Map<String, Long> appointmentsByStatus) { this.appointmentsByStatus = appointmentsByStatus; }

    public Map<String, Long> getDoctorsByDepartment() { return doctorsByDepartment; }
    public void setDoctorsByDepartment(Map<String, Long> doctorsByDepartment) { this.doctorsByDepartment = doctorsByDepartment; }
}
