package com.hospital.repository;

import com.hospital.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByIssueDateDesc(Long patientId);
    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);
    List<Prescription> findByDoctorIdOrderByIssueDateDesc(Long doctorId);
}
