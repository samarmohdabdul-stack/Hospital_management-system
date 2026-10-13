package com.hospital.controller;

import com.hospital.dto.PrescriptionRequest;
import com.hospital.dto.PrescriptionResponse;
import com.hospital.security.UserPrincipal;
import com.hospital.service.PrescriptionService;
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
@Tag(name = "Prescriptions", description = "Prescription and Medication Management")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping("/api/v1/prescriptions")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create prescription", description = "Doctors only: create medication orders and dosages")
    public ResponseEntity<PrescriptionResponse> createPrescription(
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return new ResponseEntity<>(prescriptionService.createPrescription(request, currentUser), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/prescriptions/{id}")
    @Operation(summary = "Get prescription by ID")
    public ResponseEntity<PrescriptionResponse> getPrescriptionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionById(id, currentUser));
    }

    @GetMapping("/api/v1/patients/{patientId}/prescriptions")
    @Operation(summary = "Get patient prescriptions", description = "View prescriptions for a patient (enforces strict authorization)")
    public ResponseEntity<List<PrescriptionResponse>> getPatientPrescriptions(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(patientId, currentUser));
    }
}
