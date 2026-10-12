package com.acharya.dikshanta.retail_store.identity.controller;

import com.acharya.dikshanta.retail_store.identity.dto.CreateUserRequest;
import com.acharya.dikshanta.retail_store.identity.dto.UpdateUserStatusRequest;
import com.acharya.dikshanta.retail_store.identity.dto.UserResponse;
import com.acharya.dikshanta.retail_store.identity.model.User;
import com.acharya.dikshanta.retail_store.identity.repository.UserRepository;
import com.acharya.dikshanta.retail_store.identity.service.TenantUserService;
import com.acharya.dikshanta.retail_store.tenant.repository.TenantRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/tenant/users")
@PreAuthorize("hasAnyRole('TENANT_ADMIN', 'SUPER_ADMIN')")
public class TenantUserController {

    private final TenantUserService tenantUserService;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public TenantUserController(
            TenantUserService tenantUserService,
            UserRepository userRepository,
            TenantRepository tenantRepository
    ) {
        this.tenantUserService = tenantUserService;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    private Long resolveTenantId(UserDetails userDetails, Long optionalHeaderTenantId, String tenantSlugHeader) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getTenantId() != null) {
            return user.getTenantId();
        }

        // If SUPER_ADMIN is operating on a tenant, they can provide tenantId query param
        if (optionalHeaderTenantId != null) {
            return optionalHeaderTenantId;
        }

        // Or SUPER_ADMIN provides X-Tenant-ID header (slug)
        if (tenantSlugHeader != null && !tenantSlugHeader.isBlank() && !"public".equalsIgnoreCase(tenantSlugHeader)) {
            var tenantOpt = tenantRepository.findByTenantSlug(tenantSlugHeader.trim());
            if (tenantOpt.isPresent()) {
                return tenantOpt.get().getId();
            }
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No tenant context found for user");
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getTenantUsers(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "tenantId", required = false) Long queryTenantId,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantSlugHeader
    ) {
        Long tenantId = resolveTenantId(userDetails, queryTenantId, tenantSlugHeader);
        return ResponseEntity.ok(tenantUserService.getTenantUsers(tenantId));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createTenantUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "tenantId", required = false) Long queryTenantId,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantSlugHeader,
            @Valid @RequestBody CreateUserRequest request
    ) {
        Long tenantId = resolveTenantId(userDetails, queryTenantId, tenantSlugHeader);
        UserResponse response = tenantUserService.createTenantUser(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "tenantId", required = false) Long queryTenantId,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantSlugHeader,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        Long tenantId = resolveTenantId(userDetails, queryTenantId, tenantSlugHeader);
        return ResponseEntity.ok(tenantUserService.updateUserStatus(id, tenantId, request.userStatus()));
    }
}
