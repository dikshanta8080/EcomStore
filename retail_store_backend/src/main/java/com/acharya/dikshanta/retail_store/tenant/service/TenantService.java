package com.acharya.dikshanta.retail_store.tenant.service;

import com.acharya.dikshanta.retail_store.identity.enums.Role;
import com.acharya.dikshanta.retail_store.identity.enums.UserStatus;
import com.acharya.dikshanta.retail_store.identity.model.User;
import com.acharya.dikshanta.retail_store.identity.repository.UserRepository;
import com.acharya.dikshanta.retail_store.tenant.dto.CreateTenantRequest;
import com.acharya.dikshanta.retail_store.tenant.dto.SuperAdminStatsResponse;
import com.acharya.dikshanta.retail_store.tenant.dto.TenantResponse;
import com.acharya.dikshanta.retail_store.tenant.enums.TenantStatus;
import com.acharya.dikshanta.retail_store.tenant.model.Tenant;
import com.acharya.dikshanta.retail_store.tenant.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final TenantSchemaMigrationService tenantSchemaMigrationService;
    private final PasswordEncoder passwordEncoder;

    public TenantService(
            TenantRepository tenantRepository,
            UserRepository userRepository,
            TenantSchemaMigrationService tenantSchemaMigrationService,
            PasswordEncoder passwordEncoder
    ) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.tenantSchemaMigrationService = tenantSchemaMigrationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TenantResponse createTenant(CreateTenantRequest request) {
        String slug = request.tenantSlug().trim().toLowerCase();
        if (tenantRepository.existsByTenantSlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tenant slug already exists: " + slug);
        }

        String schemaName = "tenant_" + slug.replaceAll("[^a-z0-9_]", "");
        if (tenantRepository.existsBySchemaName(schemaName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Schema already exists for slug: " + slug);
        }

        if (userRepository.existsByEmail(request.adminEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User email already registered: " + request.adminEmail());
        }

        Tenant tenant = Tenant.builder()
                .companyName(request.companyName().trim())
                .tenantSlug(slug)
                .schemaName(schemaName)
                .status(TenantStatus.ACTIVE)
                .email(request.email().trim().toLowerCase())
                .phone(request.phone())
                .address(request.address())
                .build();

        Tenant savedTenant = tenantRepository.save(tenant);

        // Dynamically provision and migrate PostgreSQL schema
        tenantSchemaMigrationService.initializeTenantSchema(schemaName);

        // Create initial TENANT_ADMIN user
        User tenantAdmin = User.builder()
                .name(request.adminName().trim())
                .email(request.adminEmail().trim().toLowerCase())
                .phone(request.phone())
                .password(passwordEncoder.encode(request.adminPassword()))
                .role(Role.TENANT_ADMIN)
                .userStatus(UserStatus.ACTIVE)
                .tenantId(savedTenant.getId())
                .build();

        userRepository.save(tenantAdmin);

        return toResponse(savedTenant, 1L);
    }

    public List<TenantResponse> getAllTenants(String search) {
        List<Tenant> tenants;
        if (search != null && !search.isBlank()) {
            tenants = tenantRepository.searchTenants(search.trim());
        } else {
            tenants = tenantRepository.findAll();
        }

        return tenants.stream()
                .map(t -> toResponse(t, userRepository.countByTenantId(t.getId())))
                .toList();
    }

    public TenantResponse getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found with ID: " + id));
        long userCount = userRepository.countByTenantId(tenant.getId());
        return toResponse(tenant, userCount);
    }

    @Transactional
    public TenantResponse updateTenantStatus(Long id, TenantStatus status) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found with ID: " + id));

        tenant.setStatus(status);
        Tenant updated = tenantRepository.save(tenant);
        long userCount = userRepository.countByTenantId(updated.getId());
        return toResponse(updated, userCount);
    }

    public SuperAdminStatsResponse getSuperAdminStats() {
        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.countByStatus(TenantStatus.ACTIVE);
        long suspendedTenants = tenantRepository.countByStatus(TenantStatus.SUSPENDED);
        long deactivatedTenants = tenantRepository.countByStatus(TenantStatus.DEACTIVATED);
        long totalUsers = userRepository.count();

        return new SuperAdminStatsResponse(
                totalTenants,
                activeTenants,
                suspendedTenants,
                deactivatedTenants,
                totalUsers
        );
    }

    private TenantResponse toResponse(Tenant tenant, long userCount) {
        return new TenantResponse(
                tenant.getId(),
                tenant.getCompanyName(),
                tenant.getTenantSlug(),
                tenant.getSchemaName(),
                tenant.getStatus(),
                tenant.getEmail(),
                tenant.getPhone(),
                tenant.getAddress(),
                tenant.getCreatedAt(),
                userCount
        );
    }
}
