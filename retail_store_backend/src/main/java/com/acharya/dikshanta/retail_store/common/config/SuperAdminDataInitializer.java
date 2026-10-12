package com.acharya.dikshanta.retail_store.common.config;

import com.acharya.dikshanta.retail_store.identity.enums.Role;
import com.acharya.dikshanta.retail_store.identity.enums.UserStatus;
import com.acharya.dikshanta.retail_store.identity.model.User;
import com.acharya.dikshanta.retail_store.identity.repository.UserRepository;
import com.acharya.dikshanta.retail_store.tenant.dto.CreateTenantRequest;
import com.acharya.dikshanta.retail_store.tenant.repository.TenantRepository;
import com.acharya.dikshanta.retail_store.tenant.service.TenantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration("superAdminDataInitializer")
public class SuperAdminDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminDataInitializer.class);

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final TenantService tenantService;
    private final PasswordEncoder passwordEncoder;
    public SuperAdminDataInitializer(
            UserRepository userRepository,
            TenantRepository tenantRepository,
            TenantService tenantService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.tenantService = tenantService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedSuperAdmin();
        seedDemoTenantAndUsers();
    }

    private void seedSuperAdmin() {
        String superAdminEmail = "superadmin@saas.com";
        if (userRepository.findByEmail(superAdminEmail).isEmpty()) {
            User superAdmin = User.builder()
                    .name("Founder & Super Admin")
                    .email(superAdminEmail)
                    .phone("+1000000000")
                    .password(passwordEncoder.encode("SuperAdmin@123"))
                    .role(Role.SUPER_ADMIN)
                    .userStatus(UserStatus.ACTIVE)
                    .tenantId(null)
                    .build();

            userRepository.save(superAdmin);
            log.info("Default Super Admin account initialized: {} (password: SuperAdmin@123)", superAdminEmail);
        }
    }

    private void seedDemoTenantAndUsers() {
        String demoSlug = "apex";
        if (tenantRepository.findByTenantSlug(demoSlug).isEmpty()) {
            log.info("Provisioning initial demo tenant: Apex Supermarket ({})", demoSlug);
            var tenantResponse = tenantService.createTenant(new CreateTenantRequest(
                    "Apex Supermarket",
                    demoSlug,
                    "contact@apexstore.com",
                    "+1 (555) 234-5678",
                    "100 Market St, Suite 400",
                    "Sarah Jenkins",
                    "tenantadmin@apex.com",
                    "TenantAdmin@123"
            ));

            Long tenantId = tenantResponse.id();

            // Seed subordinate tenant employees for testing all dashboards
            seedEmployeeIfNotExists("Alex Morgan", "inventory@apex.com", "Inventory@123", "+1 (555) 345-6789", Role.INVENTORY_MANAGER, tenantId);
            seedEmployeeIfNotExists("David Chen", "accountant@apex.com", "Accountant@123", "+1 (555) 456-7890", Role.ACCOUNTANT, tenantId);
            seedEmployeeIfNotExists("Emma Watson", "cashier@apex.com", "Cashier@123", "+1 (555) 567-8901", Role.CASHIER, tenantId);

            log.info("Demo tenant and role users seeded successfully!");
        } else {
            tenantRepository.findByTenantSlug(demoSlug).ifPresent(tenant -> {
                Long tenantId = tenant.getId();
                seedEmployeeIfNotExists("Sarah Jenkins", "tenantadmin@apex.com", "TenantAdmin@123", "+1 (555) 234-5678", Role.TENANT_ADMIN, tenantId);
                seedEmployeeIfNotExists("Alex Morgan", "inventory@apex.com", "Inventory@123", "+1 (555) 345-6789", Role.INVENTORY_MANAGER, tenantId);
                seedEmployeeIfNotExists("David Chen", "accountant@apex.com", "Accountant@123", "+1 (555) 456-7890", Role.ACCOUNTANT, tenantId);
                seedEmployeeIfNotExists("Emma Watson", "cashier@apex.com", "Cashier@123", "+1 (555) 567-8901", Role.CASHIER, tenantId);
            });
        }
    }

    private void seedEmployeeIfNotExists(
            String name,
            String email,
            String password,
            String phone,
            Role role,
            Long tenantId
    ) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User employee = User.builder()
                    .name(name)
                    .email(email)
                    .phone(phone)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .userStatus(UserStatus.ACTIVE)
                    .tenantId(tenantId)
                    .build();
            userRepository.save(employee);
        }
    }
}
