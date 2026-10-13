package com.hospital.controller;

import com.hospital.dto.MedicalRecordRequest;
import com.hospital.dto.MedicalRecordResponse;
import com.hospital.security.UserPrincipal;
import com.hospital.service.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Medical Records", description = "Clinical Consultations and Medical Records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping("/api/v1/medical-records")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create medical record", description = "Authorized doctors only: record symptoms, diagnosis, and treatment plan")
    public ResponseEntity<MedicalRecordResponse> createRecord(
            @Valid @RequestBody MedicalRecordRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return new ResponseEntity<>(medicalRecordService.createMedicalRecord(request, currentUser), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/patients/{patientId}/medical-records")
    @Operation(summary = "Get patient medical records", description = "Get medical history for a patient (authorized access only)")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientRecords(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(medicalRecordService.getPatientMedicalRecords(patientId, currentUser));
    }

    @GetMapping("/api/v1/medical-records/{id}")
    @Operation(summary = "Get medical record by ID")
    public ResponseEntity<MedicalRecordResponse> getRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(medicalRecordService.getMedicalRecordById(id, currentUser));
    }
}
