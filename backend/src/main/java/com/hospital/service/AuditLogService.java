package com.hospital.service;

import com.hospital.dto.AuditLogResponse;
import com.hospital.entity.AuditLog;
import com.hospital.entity.User;
import com.hospital.mapper.EntityDtoMapper;
import com.hospital.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final EntityDtoMapper mapper;

    public AuditLogService(AuditLogRepository auditLogRepository, EntityDtoMapper mapper) {
        this.auditLogRepository = auditLogRepository;
        this.mapper = mapper;
    }

    @Transactional
    public void log(User user, String action, String resourceName, String resourceId, String ipAddress, String details) {
        AuditLog log = new AuditLog(user, action, resourceName, resourceId, ipAddress, details);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(mapper::toAuditLogResponse);
    }
}
