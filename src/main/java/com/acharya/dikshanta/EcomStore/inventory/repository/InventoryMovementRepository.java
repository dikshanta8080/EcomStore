package com.acharya.dikshanta.EcomStore.inventory.repository;

import com.acharya.dikshanta.EcomStore.inventory.model.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
}
