package com.acharya.dikshanta.EcomStore.inventory.service;

import com.acharya.dikshanta.EcomStore.inventory.model.Inventory;
import com.acharya.dikshanta.EcomStore.products.model.Product;

public interface InventoryService {
    Inventory createInventory(Product product);

}
