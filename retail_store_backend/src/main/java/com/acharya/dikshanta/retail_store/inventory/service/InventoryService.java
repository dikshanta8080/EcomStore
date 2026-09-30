package com.acharya.dikshanta.retail_store.inventory.service;

import com.acharya.dikshanta.retail_store.inventory.model.Inventory;
import com.acharya.dikshanta.retail_store.products.model.Product;

public interface InventoryService {
    Inventory createInventory(Product product);

}
