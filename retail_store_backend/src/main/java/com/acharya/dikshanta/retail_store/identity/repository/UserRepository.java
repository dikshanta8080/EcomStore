package com.acharya.dikshanta.retail_store.identity.repository;

import com.acharya.dikshanta.retail_store.identity.enums.Role;
import com.acharya.dikshanta.retail_store.identity.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByTenantId(Long tenantId);

    List<User> findByRole(Role role);

    long countByTenantId(Long tenantId);
}
