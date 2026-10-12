package com.acharya.dikshanta.retail_store.tenant.repository;

import com.acharya.dikshanta.retail_store.tenant.enums.TenantStatus;
import com.acharya.dikshanta.retail_store.tenant.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByTenantSlug(String tenantSlug);

    Optional<Tenant> findBySchemaName(String schemaName);

    boolean existsByTenantSlug(String tenantSlug);

    boolean existsBySchemaName(String schemaName);

    long countByStatus(TenantStatus status);

    @Query("SELECT t FROM Tenant t WHERE " +
           "LOWER(t.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.tenantSlug) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Tenant> searchTenants(@Param("query") String query);
}
