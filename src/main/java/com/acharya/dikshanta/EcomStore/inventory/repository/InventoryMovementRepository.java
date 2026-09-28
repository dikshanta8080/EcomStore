package com.acharya.dikshanta.EcomStore.inventory.repository;

import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    @Override
    @EntityGraph(attributePaths = {"inventory", "inventory.product", "inventory.product.category"})
    Optional<InventoryMovement> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"inventory", "inventory.product", "inventory.product.category"})
    Page<InventoryMovement> findAll(Pageable pageable);
}
