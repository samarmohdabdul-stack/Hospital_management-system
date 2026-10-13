package com.hospital.dto;

import java.time.LocalDateTime;

public class DepartmentResponse {
    private Long id;
    private String name;
    private String description;
    private String headDoctorName;
    private long doctorCount;
    private LocalDateTime createdAt;

    public DepartmentResponse() {}

    public DepartmentResponse(Long id, String name, String description, String headDoctorName, long doctorCount, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.headDoctorName = headDoctorName;
        this.doctorCount = doctorCount;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHeadDoctorName() { return headDoctorName; }
    public void setHeadDoctorName(String headDoctorName) { this.headDoctorName = headDoctorName; }

    public long getDoctorCount() { return doctorCount; }
    public void setDoctorCount(long doctorCount) { this.doctorCount = doctorCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
