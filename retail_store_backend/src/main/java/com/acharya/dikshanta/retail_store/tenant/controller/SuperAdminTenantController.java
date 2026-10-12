package com.acharya.dikshanta.retail_store.tenant.controller;

import com.acharya.dikshanta.retail_store.tenant.dto.CreateTenantRequest;
import com.acharya.dikshanta.retail_store.tenant.dto.SuperAdminStatsResponse;
import com.acharya.dikshanta.retail_store.tenant.dto.TenantResponse;
import com.acharya.dikshanta.retail_store.tenant.dto.UpdateTenantStatusRequest;
import com.acharya.dikshanta.retail_store.tenant.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/superadmin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminTenantController {

    private final TenantService tenantService;

    public SuperAdminTenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @PostMapping("/tenants")
    public ResponseEntity<TenantResponse> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        TenantResponse response = tenantService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantResponse>> getAllTenants(@RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(tenantService.getAllTenants(query));
    }

    @GetMapping("/tenants/{id}")
    public ResponseEntity<TenantResponse> getTenantById(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getTenantById(id));
    }

    @PatchMapping("/tenants/{id}/status")
    public ResponseEntity<TenantResponse> updateTenantStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTenantStatusRequest request
    ) {
        return ResponseEntity.ok(tenantService.updateTenantStatus(id, request.status()));
    }

    @GetMapping("/stats")
    public ResponseEntity<SuperAdminStatsResponse> getStats() {
        return ResponseEntity.ok(tenantService.getSuperAdminStats());
    }
}
