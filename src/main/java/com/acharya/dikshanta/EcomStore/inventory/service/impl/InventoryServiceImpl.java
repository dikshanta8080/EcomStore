package com.acharya.dikshanta.EcomStore.inventory.service.impl;

import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.inventory.repository.InventoryRepository;
import com.acharya.dikshanta.EcomStore.inventory.service.InventoryService;
import com.acharya.dikshanta.EcomStore.products.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public Inventory createInventory(Product product) {
        checkIfProductIsNull(product);
        checkIfInventoryAlreadyExists(product);
        Inventory inventory = buildInventory(product);
        Inventory savedInventory = inventoryRepository.save(inventory);
        product.setInventory(savedInventory);
        return savedInventory;
    }

    private void checkIfInventoryAlreadyExists(Product product) {
        if (inventoryRepository.existsByProduct(product)) {
            throw new IllegalArgumentException("Inventory already exists for product");
        }
    }

    private Inventory buildInventory(Product product) {
        return Inventory.builder()
                .product(product)
                .stock(BigDecimal.ZERO)
                .build();
    }

    private void checkIfProductIsNull(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
    }
}
