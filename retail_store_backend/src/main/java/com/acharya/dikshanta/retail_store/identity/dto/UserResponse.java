package com.acharya.dikshanta.retail_store.identity.dto;

import com.acharya.dikshanta.retail_store.identity.enums.Role;
import com.acharya.dikshanta.retail_store.identity.enums.UserStatus;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        String phone,
        Role role,
        UserStatus userStatus,
        Long tenantId,
        LocalDateTime createdAt
) {}
