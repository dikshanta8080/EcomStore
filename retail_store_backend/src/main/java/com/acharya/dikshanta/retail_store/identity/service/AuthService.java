package com.acharya.dikshanta.retail_store.identity.service;

import com.acharya.dikshanta.retail_store.identity.dto.LoginRequest;
import com.acharya.dikshanta.retail_store.identity.dto.LoginResponse;
import com.acharya.dikshanta.retail_store.identity.dto.UserSummaryResponse;
import com.acharya.dikshanta.retail_store.identity.enums.UserStatus;
import com.acharya.dikshanta.retail_store.identity.model.User;
import com.acharya.dikshanta.retail_store.identity.repository.UserRepository;
import com.acharya.dikshanta.retail_store.security.JwtService;
import com.acharya.dikshanta.retail_store.tenant.enums.TenantStatus;
import com.acharya.dikshanta.retail_store.tenant.model.Tenant;
import com.acharya.dikshanta.retail_store.tenant.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            TenantRepository tenantRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (user.getUserStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is " + user.getUserStatus());
        }

        Tenant tenant = null;
        if (user.getTenantId() != null) {
            Optional<Tenant> tenantOpt = tenantRepository.findById(user.getTenantId());
            if (tenantOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Associated tenant not found");
            }
            tenant = tenantOpt.get();
            if (tenant.getStatus() == TenantStatus.SUSPENDED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tenant account is SUSPENDED. Please contact administrator.");
            }
            if (tenant.getStatus() == TenantStatus.DEACTIVATED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tenant account is DEACTIVATED.");
            }
        }

        String tenantSlug = tenant != null ? tenant.getTenantSlug() : null;
        String schemaName = tenant != null ? tenant.getSchemaName() : "public";
        String companyName = tenant != null ? tenant.getCompanyName() : "SaaS Platform Master";

        String token = jwtService.generateToken(user, tenantSlug, schemaName);

        UserSummaryResponse summary = new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getUserStatus(),
                user.getTenantId(),
                tenantSlug,
                schemaName,
                companyName
        );

        return new LoginResponse(token, summary);
    }

    public UserSummaryResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Tenant tenant = null;
        if (user.getTenantId() != null) {
            tenant = tenantRepository.findById(user.getTenantId()).orElse(null);
        }

        String tenantSlug = tenant != null ? tenant.getTenantSlug() : null;
        String schemaName = tenant != null ? tenant.getSchemaName() : "public";
        String companyName = tenant != null ? tenant.getCompanyName() : "SaaS Platform Master";

        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getUserStatus(),
                user.getTenantId(),
                tenantSlug,
                schemaName,
                companyName
        );
    }
}
