package com.acharya.dikshanta.retail_store.tenant.dto;

import com.acharya.dikshanta.retail_store.tenant.enums.TenantStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateTenantRequest(
        @NotBlank(message = "Company name is required")
        String companyName,

        @NotBlank(message = "Tenant slug is required")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
        String tenantSlug,

        @NotBlank(message = "Company email is required")
        @Email(message = "Invalid email format")
        String email,

        String phone,
        String address,

        @NotBlank(message = "Admin name is required")
        String adminName,

        @NotBlank(message = "Admin email is required")
        @Email(message = "Invalid admin email format")
        String adminEmail,

        @NotBlank(message = "Admin password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String adminPassword
) {}
