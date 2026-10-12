package com.acharya.dikshanta.retail_store.identity.service;

import com.acharya.dikshanta.retail_store.identity.dto.CreateUserRequest;
import com.acharya.dikshanta.retail_store.identity.dto.UserResponse;
import com.acharya.dikshanta.retail_store.identity.enums.Role;
import com.acharya.dikshanta.retail_store.identity.enums.UserStatus;
import com.acharya.dikshanta.retail_store.identity.model.User;
import com.acharya.dikshanta.retail_store.identity.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TenantUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TenantUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse createTenantUser(CreateUserRequest request, Long tenantId) {
        if (tenantId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant ID cannot be null");
        }

        // Enforce RBAC restriction: Tenant admin cannot create SUPER_ADMIN or TENANT_ADMIN
        if (request.role() == Role.SUPER_ADMIN || request.role() == Role.TENANT_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Tenant Admin is not permitted to create users with role " + request.role() +
                    ". Permitted roles are: INVENTORY_MANAGER, ACCOUNTANT, CASHIER."
            );
        }

        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User email already exists: " + email);
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(email)
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .userStatus(UserStatus.ACTIVE)
                .tenantId(tenantId)
                .build();

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public List<UserResponse> getTenantUsers(Long tenantId) {
        if (tenantId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant ID cannot be null");
        }
        return userRepository.findByTenantId(tenantId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, Long tenantId, UserStatus newStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + userId));

        if (!tenantId.equals(user.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot modify users outside of your tenant");
        }

        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot alter SUPER_ADMIN status");
        }

        user.setUserStatus(newStatus);
        User updated = userRepository.save(user);
        return toResponse(updated);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getUserStatus(),
                user.getTenantId(),
                user.getCreatedAt()
        );
    }
}
