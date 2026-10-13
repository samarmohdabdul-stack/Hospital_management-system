package com.hospital.service;

import com.hospital.dto.DepartmentRequest;
import com.hospital.dto.DepartmentResponse;
import com.hospital.dto.DoctorResponse;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.exception.ConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final EntityDtoMapper mapper;

    public DepartmentService(DepartmentRepository departmentRepository,
                             DoctorRepository doctorRepository,
                             EntityDtoMapper mapper) {
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream().map(dept -> {
            long docCount = doctorRepository.findByDepartmentId(dept.getId()).size();
            return mapper.toDepartmentResponse(dept, docCount);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        long docCount = doctorRepository.findByDepartmentId(dept.getId()).size();
        return mapper.toDepartmentResponse(dept, docCount);
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Department already exists with name: " + request.getName());
        }

        Department dept = new Department(
                request.getName(),
                request.getDescription(),
                request.getHeadDoctorName()
        );
        dept = departmentRepository.save(dept);
        return mapper.toDepartmentResponse(dept, 0);
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!dept.getName().equalsIgnoreCase(request.getName()) &&
                departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Department already exists with name: " + request.getName());
        }

        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        dept.setHeadDoctorName(request.getHeadDoctorName());

        dept = departmentRepository.save(dept);
        long docCount = doctorRepository.findByDepartmentId(dept.getId()).size();
        return mapper.toDepartmentResponse(dept, docCount);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        List<Doctor> assignedDoctors = doctorRepository.findByDepartmentId(id);
        if (!assignedDoctors.isEmpty()) {
            throw new ConflictException("Cannot delete department with " + assignedDoctors.size() + " assigned doctors. Reassign them first.");
        }

        departmentRepository.delete(dept);
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getDoctorsInDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        return doctorRepository.findByDepartmentId(departmentId).stream()
                .map(mapper::toDoctorResponse)
                .collect(Collectors.toList());
    }
}
