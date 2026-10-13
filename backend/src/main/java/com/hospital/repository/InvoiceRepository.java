package com.hospital.repository;

import com.hospital.entity.Invoice;
import com.hospital.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByPatientIdOrderByIssueDateDesc(Long patientId);
    Page<Invoice> findByPatientId(Long patientId, Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:patientId IS NULL OR i.patient.id = :patientId) AND " +
           "(:status IS NULL OR i.status = :status)")
    Page<Invoice> filterInvoices(@Param("patientId") Long patientId,
                                @Param("status") InvoiceStatus status,
                                Pageable pageable);

    long countByStatus(InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount - i.paidAmount), 0) FROM Invoice i WHERE i.status != 'PAID' AND i.status != 'CANCELLED'")
    BigDecimal calculateOutstandingAmount();

    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i")
    BigDecimal calculateTotalRevenue();
}
