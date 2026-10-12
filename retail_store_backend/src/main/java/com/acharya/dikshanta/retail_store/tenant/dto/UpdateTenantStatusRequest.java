package com.acharya.dikshanta.retail_store.tenant.dto;

import com.acharya.dikshanta.retail_store.tenant.enums.TenantStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTenantStatusRequest(
        @NotNull(message = "Status cannot be null")
        TenantStatus status
) {}
