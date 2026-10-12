package com.acharya.dikshanta.retail_store.identity.dto;

import com.acharya.dikshanta.retail_store.identity.enums.Role;
import com.acharya.dikshanta.retail_store.identity.enums.UserStatus;

public record UserSummaryResponse(
        Long id,
        String name,
        String email,
        String phone,
        Role role,
        UserStatus userStatus,
        Long tenantId,
        String tenantSlug,
        String schemaName,
        String companyName
) {}
