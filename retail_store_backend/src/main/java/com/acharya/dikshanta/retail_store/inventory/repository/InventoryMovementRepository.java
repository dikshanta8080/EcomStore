package com.acharya.dikshanta.retail_store.inventory.repository;

import com.acharya.dikshanta.retail_store.inventory.model.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long>, JpaSpecificationExecutor<InventoryMovement> {

    @Override
    @EntityGraph(attributePaths = {
            "inventory",
            "inventory.product",
            "inventory.product.category",
            "inventory.product.baseUnit",
            "unit",
            "baseUnit"
    })
    Optional<InventoryMovement> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {
            "inventory",
            "inventory.product",
            "inventory.product.category",
            "inventory.product.baseUnit",
            "unit",
            "baseUnit"
    })
    Page<InventoryMovement> findAll(Pageable pageable);

    boolean existsByUnitIdOrBaseUnitId(Long unitId, Long baseUnitId);

    boolean existsByInventoryProduct_IdAndUnitId(Long productId, Long unitId);
}
