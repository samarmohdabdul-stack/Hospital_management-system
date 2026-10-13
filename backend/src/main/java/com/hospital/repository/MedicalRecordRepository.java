package com.hospital.repository;

import com.hospital.entity.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByConsultationDateDesc(Long patientId);
    Page<MedicalRecord> findByPatientId(Long patientId, Pageable pageable);
    List<MedicalRecord> findByDoctorIdOrderByConsultationDateDesc(Long doctorId);
}
