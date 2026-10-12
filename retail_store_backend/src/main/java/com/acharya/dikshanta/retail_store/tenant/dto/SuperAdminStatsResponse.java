package com.acharya.dikshanta.retail_store.tenant.dto;

public record SuperAdminStatsResponse(
        long totalTenants,
        long activeTenants,
        long suspendedTenants,
        long deactivatedTenants,
        long totalUsers
) {}
