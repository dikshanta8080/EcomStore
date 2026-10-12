package com.acharya.dikshanta.retail_store.tenant.dto;

import com.acharya.dikshanta.retail_store.tenant.enums.TenantStatus;

import java.time.LocalDateTime;

public record TenantResponse(
        Long id,
        String companyName,
        String tenantSlug,
        String schemaName,
        TenantStatus status,
        String email,
        String phone,
        String address,
        LocalDateTime createdAt,
        long userCount
) {}
