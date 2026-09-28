package com.acharya.dikshanta.EcomStore.inventory.repository;

import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    boolean existsByProductId(Long productId);

    Optional<Inventory> findByProductId(Long productId);

    Optional<Inventory> findByProduct(Product product);

    boolean existsByProduct(Product product);

}
